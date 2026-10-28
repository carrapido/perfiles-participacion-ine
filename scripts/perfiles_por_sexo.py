"""Segmentación estratificada por sexo: se agrupan por separado las celdas de mujeres y las de hombres,
para que cada perfil contenga un solo sexo. Mismas variables y algoritmo que piloto_perfiles.py.
Uso: python scripts/perfiles_por_sexo.py            -> métricas por k para cada sexo
     python scripts/perfiles_por_sexo.py 3 2        -> describe k=3 para mujeres y k=2 para hombres"""
import numpy as np, pandas as pd, os, sys
FEATS = ["nivel","tendencia","ciclo","ventaja","rural"]
A, OUT = "data/agregados", "data/resultados/por_sexo"; os.makedirs(OUT, exist_ok=True)
ANIOS = [2009, 2012, 2015, 2018, 2021, 2024]
ETAPA = {"18":"18-24","19":"18-24","20-24":"18-24","25-29":"25-34","30-34":"25-34","35-39":"35-44","40-44":"35-44",
         "45-49":"45-59","50-54":"45-59","55-59":"45-59","60-64":"60-69","65-69":"60-69"}
ORDEN = ["18-24","25-34","35-44","45-59","60-69","70+"]; K = ["EDOCVE","MPIOCVE","SEXO","ETAPA"]

def celdas(ruta):
    d = pd.read_csv(ruta, low_memory=False); d = d[d.SEXO.isin([0,1])].copy()
    d["ETAPA"] = d.GEDAD.astype(str).map(ETAPA).fillna("70+")
    d["LN_R"] = np.where(d.TIPOSEC=="R", d.LN, 0)
    return d.groupby(K)[["LN","SV","NV","LN_R"]].sum()

P = {a: celdas(f"{A}/agg_{a}.csv") for a in ANIOS}
part = pd.DataFrame({a: 100*P[a].SV/(P[a].SV+P[a].NV) for a in ANIOS}); ln = pd.DataFrame({a: P[a].LN for a in ANIOS})
ok = part.notna().all(axis=1) & (ln.min(axis=1) >= 100)
otro = part.copy(); otro.index = otro.index.set_levels(otro.index.levels[2].map(lambda s: 1-s), level=2); otro = otro.reindex(part.index)
ok &= otro.notna().all(axis=1); part, otro, ln = part[ok], otro[ok], ln[ok]
t = np.array(ANIOS, float); F = pd.DataFrame(index=part.index)
F["nivel"] = part.mean(axis=1)
F["tendencia"] = 3*((part.sub(part.mean(axis=1),axis=0))*(t-t.mean())).sum(axis=1)/((t-t.mean())**2).sum()
F["ciclo"] = part[[2012,2018,2024]].mean(axis=1) - part[[2009,2015,2021]].mean(axis=1)
F["ventaja"] = (part - otro).mean(axis=1)
F["rural"] = 100*P[2024].LN_R.reindex(F.index)/P[2024].LN.reindex(F.index)

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
def silueta(X, lab, rng, m=2000):
    i = rng.choice(len(X), size=min(m,len(X)), replace=False); Xs, ls = X[i], lab[i]
    D = np.sqrt(((Xs[:,None,:]-Xs[None])**2).sum(-1)); s = []
    for a in range(len(Xs)):
        same = ls==ls[a]; same[a] = False
        if not same.any(): continue
        b = min(D[a,ls==j].mean() for j in set(ls) if j!=ls[a]); aa = D[a,same].mean(); s.append((b-aa)/max(aa,b))
    return float(np.mean(s))
def ari(a, b):
    ct = pd.crosstab(a, b).to_numpy(); c2 = lambda x: x*(x-1)/2
    s = c2(ct).sum(); sa = c2(ct.sum(1)).sum(); sb = c2(ct.sum(0)).sum(); e = sa*sb/c2(ct.sum()); return (s-e)/((sa+sb)/2-e)

def preparar(sexo):
    Fs = F[F.index.get_level_values(2) == sexo]; w = ln[2024].reindex(Fs.index).to_numpy(float)
    mu = np.average(Fs[FEATS], axis=0, weights=w); sd = Fs[FEATS].std().to_numpy()
    return Fs, (Fs[FEATS].to_numpy()-mu)/sd, w

NOM = {1: "mujeres", 0: "hombres"}
if len(sys.argv) == 1:
    rng = np.random.default_rng(7); filas = []
    for sexo in (1, 0):
        Fs, X, w = preparar(sexo)
        for k in range(2, 6):
            best = min((kmeans(X,w,k,s) for s in range(6)), key=lambda r: r[2]); est = []
            for r in range(5):
                i = rng.choice(len(X), size=int(.8*len(X)), replace=False); lb, _, _ = kmeans(X[i], w[i], k, 100+r); est.append(ari(best[0][i], lb))
            filas.append({"sexo": NOM[sexo], "celdas": len(X), "k": k, "inercia": round(best[2],3), "silueta": round(silueta(X,best[0],rng),3), "estabilidad_ARI": round(float(np.mean(est)),3)})
            print(filas[-1], flush=True)
    pd.DataFrame(filas).to_csv(f"{OUT}/metricas_k.csv", index=False)
else:
    kM, kH = int(sys.argv[1]), int(sys.argv[2]); pj = celdas(f"{A}/agg_PJ2025.csv"); total = ln[2024].sum(); res = []; asig = []
    for sexo, k in ((1, kM), (0, kH)):
        Fs, X, w = preparar(sexo); lab = min((kmeans(X,w,k,s) for s in range(6)), key=lambda r: r[2])[0]
        W = ln[2024].reindex(Fs.index); tot_sexo = W.sum()
        for p in range(k):
            m = lab == p; idx = Fs.index[m]; Wp = W[m]
            r = {"sexo": NOM[sexo], "grupo": p, "pct_LN_total": 100*Wp.sum()/total, "pct_de_su_sexo": 100*Wp.sum()/tot_sexo, "celdas": int(m.sum())}
            for a in ANIOS: s = P[a].reindex(idx); r[f"p{a}"] = 100*s.SV.sum()/(s.SV.sum()+s.NV.sum())
            for c in FEATS: r[c] = np.average(Fs.loc[idx, c], weights=Wp)
            s = pj.reindex(idx); r["pPJ2025"] = 100*s.SV.sum()/(s.SV.sum()+s.NV.sum())
            for e in ORDEN: r[e] = 100*Wp[idx.get_level_values(3)==e].sum()/Wp.sum()
            ent = Wp.groupby(level=0).sum(); entot = ln[2024][ln.index.get_level_values(2)==sexo].groupby(level=0).sum()
            conc = (100*ent/entot).sort_values(ascending=False); r["concentracion"] = ", ".join(f"{int(e)}:{v:.0f}%" for e, v in conc.head(5).items())
            res.append(r)
        asig.append(pd.DataFrame({"perfil_sexo": [f"{NOM[sexo]}_{l}" for l in lab]}, index=Fs.index))
    R = pd.DataFrame(res); pd.set_option("display.width", 320); pd.set_option("display.max_columns", 60)
    print(R.round(1).to_string(index=False)); R.round(2).to_csv(f"{OUT}/perfiles_resumen_k{kM}_{kH}.csv", index=False)
    pd.concat(asig).reset_index().to_csv(f"{OUT}/celdas_k{kM}_{kH}.csv", index=False)
