# How to Fork this template

I could -- but I did not -- define this as a "Template repository" in GitHub, as described here:

- [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

I did not because this page says that when a new project is created using GitHub's "Use this template" feature,
the new project is created with a rewritten history.

- [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

  > A new fork includes the entire commit history of the parent repository, while a repository created from a template starts with a single commit.

Rewriting history makes it difficult to merge later changes from the upstream template into the new project.

So instead, create a new project by more simply forking from the template repository
-- the following is an example using `apis` as the name of the new repository
and assuming you create the empty repository on GitHub.

```
git clone https://github.com/cwellsx/electron_forge_template.git apis
cd apis
git remote rename origin upstream
git remote set-url --push upstream no_push
git merge upstream/sqlite
git remote add origin https://github.com/cwellsx/apis.git
git push -u origin main
```
