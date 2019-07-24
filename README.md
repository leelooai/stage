1. Create directory for projects `mkdir leeloo-fb-tokens` and go inside.
2. Clone existing repository for making changes `git clone https://github.com/leelooai/[version].git`
3. Create new version from existing `git clone https://github.com/leelooai/[version].git [new_version]`. Then create repo on github, change remote origin `git remote add origin https://github.com/leelooai/[new_version].git`, change `name` to `[new_version]` and  `homepage` to `https://leelooai.github.io/[new_version]` in `package.json`, push `git push -u origin master`.
4. Install dependencies `npm run install`.
5. Deploy to github pages `npm run deploy`