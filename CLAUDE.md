@AGENTS.md

## 菜谱数据修改

**硬规则：绝不直接修改 `src/data/recipes-all.json`**（它是合并产物，会被覆盖）。

新增/修改菜谱请改源文件（`recipes-quality-*.json` / `recipes-mega-*.json` / `recipes-legacy.json` 等），然后运行：

```bash
npm run recipes:check   # 全链路：enrich → merge → audit:strict
```

完整工作流和审计规则见 [docs/recipes-pipeline.md](docs/recipes-pipeline.md)。
