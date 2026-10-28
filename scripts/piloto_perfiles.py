"""Primera corrida de los perfiles con la base completa (CCPC 2009-2024 + PJ 2025 para validar).
Unidad: celda municipio x sexo x etapa de vida. Variables: nivel, tendencia, ciclo presidencial,
ventaja frente al otro sexo y % de LN rural. k-means ponderado por LN, escrito en numpy.
Es una corrida exploratoria: el notebook (fase 2) la formaliza y compara con GMM y Ward.
Uso: python scripts/piloto_perfiles.py"""
import numpy as np, pandas as pd, os
FEATS = ["nivel","tendencia","ciclo","ventaja","rural"]
A, OUT = "data/agregados", "data/resultados/piloto"; os.makedirs(OUT, exist_ok=True)
ANIOS = [2009, 2012, 2015, 2018, 2021, 2024]
ETAPA = {"18":"18-24","19":"18-24","20-24":"18-24","25-29":"25-34","30-34":"25-34","35-39":"35-44","40-44":"35-44",
         "45-49":"45-59","50-54":"45-59","55-59":"45-59","60-64":"60-69","65-69":"60-69"}
ORDEN = ["18-24","25-34","35-44","45-59","60-69","70+"]; K = ["EDOCVE","MPIOCVE","SEXO","ETAPA"]

def celdas(ruta):
    d = pd.read_csv(ruta, low_memory=False); d = d[d.SEXO.isin([0,1])].copy()
    d["ETAPA"] = d.GEDAD.astype(str).map(ETAPA).fillna("70+")
    d["LN_R"] = np.where(d.TIPOSEC=="R", d.LN, 0); d["LN_U"] = np.where(d.TIPOSEC=="U", d.LN, 0)
    return d.groupby(K)[["LN","SV","NV","LN_R","LN_U"]].sum()

P = {a: celdas(f"{A}/agg_{a}.csv") for a in ANIOS}
part = pd.DataFrame({a: 100*P[a].SV/(P[a].SV+P[a].NV) for a in ANIOS})
ln = pd.DataFrame({a: P[a].LN for a in ANIOS})
ok = part.notna().all(axis=1) & (ln.min(axis=1) >= 100)
otro = part.copy(); otro.index = otro.index.set_levels(otro.index.levels[2].map(lambda s: 1-s), level=2)
otro = otro.reindex(part.index)
ok &= otro.notna().all(axis=1)
part, otro, ln = part[ok], otro[ok], ln[ok]
t = np.array(ANIOS, float)
F = pd.DataFrame(index=part.index)
F["nivel"] = part.mean(axis=1)
F["tendencia"] = 3*((part.sub(part.mean(axis=1),axis=0))*(t-t.mean())).sum(axis=1)/((t-t.mean())**2).sum()   # puntos por elección
F["ciclo"] = part[[2012,2018,2024]].mean(axis=1) - part[[2009,2015,2021]].mean(axis=1)
F["ventaja"] = (part - otro).mean(axis=1)
F["rural"] = 100*P[2024].LN_R.reindex(F.index)/P[2024].LN.reindex(F.index)
w = ln[2024].to_numpy(float)
cubre = 100*w.sum()/sum(P[2024].LN.sum() for _ in [0])
print(f"Celdas: {len(F)} | LN 2024 cubierta: {cubre:.1f}%")
feats, descriptores = FEATS, list(F.columns)
mu = np.average(F[feats], axis=0, weights=w); sd = F[feats].std().to_numpy()
X = ((F[feats].to_numpy()-mu)/sd)

def kmeans(X, w, k, seed, it=200):
    rng = np.random.default_rng(seed); n = len(X); C = [X[rng.choice(n, p=w/w.sum())]]
    for _ in range(k-1):
        d2 = np.min(((X[:,None,:]-np.array(C)[None])**2).sum(-1), 1); C.append(X[rng.choice(n, p=w*d2/(w*d2).sum())])
    C = np.array(C)
    for _ in range(it):
        lab = ((X[:,None,:]-C[None])**2).sum(-1).argmin(1)
        nC = np.array([np.average(X[lab==j],axis=0,weights=w[lab==j]) if (lab==j).any() else C[j] for j in range(k)])
        if np.allclose(nC, C): break
        C = nC
    return lab, C, (w*((X-C[lab])**2).sum(1)).sum()/w.sum()

def silueta(X, lab, rng, m=2500):
    i = rng.choice(len(X), size=min(m,len(X)), replace=False); Xs, ls = X[i], lab[i]
    D = np.sqrt(((Xs[:,None,:]-Xs[None])**2).sum(-1)); s = []
    for a in range(len(Xs)):
        same = ls==ls[a]; same[a] = False
        if not same.any(): continue
        s.append((min(D[a,ls==j].mean() for j in set(ls) if j!=ls[a]) - D[a,same].mean()) / max(D[a,same].mean(), min(D[a,ls==j].mean() for j in set(ls) if j!=ls[a])))
    return float(np.mean(s))

def ari(a, b):
    ct = pd.crosstab(a, b).to_numpy(); c2 = lambda x: x*(x-1)/2
    s = c2(ct).sum(); sa = c2(ct.sum(1)).sum(); sb = c2(ct.sum(0)).sum(); e = sa*sb/c2(ct.sum())
    return (s-e)/((sa+sb)/2-e)

rng = np.random.default_rng(7); met = []; sols = {}
for k in range(3, 9):
    best = min((kmeans(X,w,k,s) for s in range(6)), key=lambda r: r[2]); sols[k] = best
    est = []
    for r in range(5):   # estabilidad: re-ajustar en 80% y comparar etiquetas
        i = rng.choice(len(X), size=int(.8*len(X)), replace=False)
        lb, Cb, _ = kmeans(X[i], w[i], k, 100+r)
        est.append(ari(best[0][i], lb))
    met.append({"k":k, "inercia":round(best[2],3), "silueta":round(silueta(X,best[0],rng),3), "estabilidad_ARI":round(float(np.mean(est)),3)})
M = pd.DataFrame(met); print(M.to_string(index=False)); M.to_csv(f"{OUT}/metricas_k.csv", index=False)

lab = sols[5][0]; F["perfil"] = lab
pj = celdas(f"{A}/agg_PJ2025.csv").reindex(F.index)
filas = []
for p in range(5):
    m = (lab==p); idx = F.index[m]; W = ln[2024][m]
    r = {"perfil": p, "pct_LN": 100*W.sum()/ln[2024].sum(), "pct_mujeres": 100*W[idx.get_level_values(2)==1].sum()/W.sum()}
    for a in ANIOS:
        s = P[a].reindex(idx); r[f"p{a}"] = 100*s.SV.sum()/(s.SV.sum()+s.NV.sum())
    for c in descriptores: r[c] = np.average(F.loc[idx,c], weights=W)
    s = pj.loc[idx]; r["pPJ2025"] = 100*s.SV.sum()/(s.SV.sum()+s.NV.sum())
    for e in ORDEN: r[e] = 100*W[idx.get_level_values(3)==e].sum()/W.sum()
    for sx in (0,1):
        mm = idx.get_level_values(2)==sx
        s = P[2024].reindex(idx[mm]); r[f"p2024_{'H' if sx==0 else 'M'}"] = 100*s.SV.sum()/(s.SV.sum()+s.NV.sum()) if mm.any() else np.nan
    ent = W.groupby(level=0).sum().sort_values(ascending=False)
    r["top_entidades"] = ",".join(str(int(e)) for e in ent.index[:5])
    filas.append(r)
R = pd.DataFrame(filas).sort_values("nivel"); pd.set_option("display.width", 300); pd.set_option("display.max_columns", 50)
print(R.round(1).to_string(index=False))
t2 = pd.crosstab([F.index.get_level_values(2)], [lab, F.index.get_level_values(3)], values=ln[2024].to_numpy(), aggfunc="sum")
R.round(2).to_csv(f"{OUT}/perfiles_resumen.csv", index=False); F.reset_index().to_csv(f"{OUT}/celdas_perfiles.csv", index=False)
