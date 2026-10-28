import sys, pandas as pd
df = pd.read_csv(sys.argv[1])
estados = sys.argv[2].split(",") if len(sys.argv)>2 and sys.argv[2] else None
if estados: df = df[df.EDOCVE.isin([int(e) for e in estados])]
df = df[df.SEXO.isin([0,1])]
def tasa(g): 
    s = g[["LN","SV","NV","NS"]].sum()
    return pd.Series({"part": 100*s.SV/(s.SV+s.NV), "part_LN": 100*s.SV/s.LN, "ns_pct": 100*s.NS/s.LN, "LN": s.LN})
print("Entidades:", sorted(df.EDOCVE.unique()), " LN total:", int(df.LN.sum()))
print(df.groupby("SEXO").apply(tasa).round(2))
p = df.groupby(["GEDAD","SEXO"]).apply(tasa)["part"].unstack().rename(columns={0:"H",1:"M"})
order = ["18","19","20-24","25-29","30-34","35-39","40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80-84","85+"]
p = p.reindex(order); p["brecha_M-H"] = p.M - p.H
print(p.round(1))
t = df.groupby(["TIPOSEC","SEXO"]).apply(tasa)["part"].unstack().rename(columns={0:"H",1:"M"}); t["brecha"]=t.M-t.H
print(t.round(1))
e = df.groupby(["EDOCVE","SEXO"]).apply(tasa)["part"].unstack().rename(columns={0:"H",1:"M"}); e["brecha"]=e.M-e.H
print(e.round(1).sort_values("brecha"))
