# 分支归档

存放**已删除分支**的 git bundle。分支删掉后，内容仍可从这里完整恢复。

判断「该不该恢复」的依据不在这里，在
[`docs/operations/unmerged-branch-inventory-v0.1.md`](../../docs/operations/unmerged-branch-inventory-v0.1.md)——
那份台账逐簇记录了每部分是什么、为什么没落地、什么条件下重新评估。**先读台账再解包**：
多数情况下需要的是那些判断，不是代码。

## 归档清单

| 文件 | 分支 | 归档时间 | 顶端提交 |
| --- | --- | --- | --- |
| `design-system-v2-2026-08-29.bundle` | `design-system-v2` | 2026-08-29 | `f73065c` |

## 恢复方法

bundle 是**增量**的：只含 `main` 上没有的提交，因此需要本仓库的历史作为基底
（依赖 `fa0996a`，在 `main` 上）。完整克隆下可直接使用；浅克隆需先 `git fetch --unshallow`。

```bash
git bundle verify archive/branches/design-system-v2-2026-08-29.bundle
git fetch archive/branches/design-system-v2-2026-08-29.bundle \
  'refs/tags/archive/*:refs/tags/restored/*'
git log --oneline restored/design-system-v2-2026-08-29
```

只想取某个文件，不必建分支：

```bash
git show restored/design-system-v2-2026-08-29:<path>
```

## 为什么用 bundle 而不是推 tag

推 tag 到远端同样能保住内容，且体积更小。这里选 bundle 是因为归档物需要
**在仓库里可见、可被检索到**——一个只存在于 refs 里的 tag，下一个来清理的人看不见它，
也就重现了这套归档本来要防的失败：内容还在，但没人知道它在、更不知道它是什么。
