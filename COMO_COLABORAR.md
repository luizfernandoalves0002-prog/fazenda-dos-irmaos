# Como colaborar no jogo Fazenda dos Irmãos

Esse é o projeto do jogo. Aqui tá o combinado pra nós dois melhorarmos o jogo juntos **sem um sobrescrever o trabalho do outro** e com os dois **vendo cada melhoria rodando antes** dela ir pro ar.

Repositório: https://github.com/luizfernandoalves0002-prog/fazenda-dos-irmaos

Jogo publicado (oficial): https://luizfernandoalves0002-prog.github.io/fazenda-dos-irmaos/

## A regra de ouro

**Ninguém edita a `main` direto.** A `main` É o jogo publicado — tudo que entra nela vai pro ar em ~1 minuto.

Toda melhoria segue o caminho: **branch → Pull Request → o outro testa pelo link de preview → aprovou → merge → publicou**. Assim é impossível apagar o trabalho do outro sem querer, e nada muda no jogo oficial sem os dois terem visto.

## Primeira vez no projeto?

1. Baixa o projeto: `git clone https://github.com/luizfernandoalves0002-prog/fazenda-dos-irmaos.git`
2. Abre a pasta no Claude Code (ou `claude` no terminal, dentro dela) e pede as mudanças normalmente, tipo "adiciona tal coisa no jogo".
3. O jogo inteiro tá num único arquivo, o `index.html`. Pra testar, é só dar duplo clique nele — abre no navegador, roda tudo local, sem servidor.

## Passo a passo pra fazer uma melhoria

**1. Começa sempre atualizado:**

```bash
git checkout main
git pull
```

**2. Cria uma branch com um nome curto que diga o que é:**

```bash
git checkout -b melhoria/nome-da-melhoria
```

(ex.: `melhoria/loja-de-sementes`, `correcao/bug-do-save`)

**3. Edita o `index.html`, testa no navegador** (duplo clique no arquivo).

**4. Salva e sobe a branch:**

```bash
git add index.html
git commit -m "descreve o que você mudou aqui"
git push -u origin melhoria/nome-da-melhoria
```

**5. Abre o Pull Request:** entra no site do repositório — o GitHub mostra um botão amarelo **"Compare & pull request"**, é só clicar e criar. Se o botão amarelo não aparecer (ele some depois de umas horas): aba **Pull requests** → **New pull request** → em "compare", escolhe sua branch → **Create pull request**.

**6. O robô comenta no PR um link de preview jogável.** Manda o link pro outro — ele joga a versão nova **sem instalar nada e sem o jogo oficial mudar**.

**7. O outro testou e gostou?** Ele aprova no próprio PR: aba **"Files changed"** → **"Review changes"** → marca **"Approve"** → **"Submit review"** (sem clicar no Submit, não conta). Achou problema? Comenta no PR, você arruma, dá push de novo na mesma branch — o robô atualiza o link sozinho e o outro testa **e aprova de novo** (todo commit novo derruba a aprovação anterior automaticamente; é assim que garantimos que os dois viram a versão final).

**8. Merge:** botão verde **"Merge pull request"** no PR. Se o GitHub mostrar **"Update branch"** antes (significa que a `main` andou enquanto o PR tava aberto), clica nele, espera o robô comentar o link novo e o outro testa e **aprova de novo** — é rápido, e garante que o que vai pro ar é exatamente o que foi testado.

Em ~1 minuto depois do merge, o jogo oficial atualiza.

**9. Os dois voltam pra base atualizada:**

```bash
git checkout main
git pull
```

## O link de preview (como funciona)

Quando um PR abre (ou recebe commit novo), um robô do GitHub comenta nele com dois links:

- **"Jogar esta melhoria agora"** — abre exatamente a versão daquele commit, na hora. É o link pra testar.
- Link alternativo da branch — sempre a última versão, mas pode levar ~5 min pra refletir um push novo.

**Testa sempre numa janela anônima NOVA** (Ctrl+Shift+N, e fecha as anônimas antigas antes): os previews de PRs diferentes dividem o mesmo cofre de save no navegador, então sem janela limpa você pode carregar o save de outro teste e achar que o jogo bugou (ou deixar de ver um bug real). Janela anônima nova = jogo zerado.

Pelo mesmo motivo: **nunca guardar dado pessoal de verdade no save do jogo** — no preview ele vive num domínio compartilhado.

O jogo oficial não é afetado por nada disso: o save de quem joga o oficial fica intocado.

## Pra nunca sobrescrever o trabalho um do outro

- **Nunca usar `git push --force`.** Push rejeitado na sua **branch**? A resposta é `git pull` — NUNCA `--force` (rejeição significa que tem coisa nova lá; forçar apaga o trabalho do outro do ar). Push rejeitado na **`main`**? Não insiste e não dá pull em loop — você commitou na `main` local sem querer; segue a receita da seção abaixo.
- **Sempre `git pull` na `main` antes de criar branch nova.**
- **Uma melhoria por PR**, e mergeia rápido. Branch que fica dias aberta é a receita do conflito — o `index.html` é um arquivo só.
- **A `main` andou enquanto seu PR tava aberto?** Usa o botão **"Update branch"** no PR (ou `git pull origin main` na sua branch + push). O robô comenta o link novo e o outro re-testa antes do merge.
- **Conflito NUNCA se resolve no botão "Resolve conflicts" do site** — é um editor de texto cego, sem rodar o jogo. Sempre local: resolve, roda o jogo, testa, commit e push — e o outro re-testa o preview antes do merge.
- **Avisa no grupo o que você vai mexer** antes de começar, pra não pegarem a mesma parte do arquivo ao mesmo tempo.

## Esqueci e commitei na `main` local, e agora?

Acontece, e nada se perde — é só levar seus commits pra uma branch:

```bash
git checkout -b melhoria/nome-da-melhoria
git push -u origin melhoria/nome-da-melhoria
git checkout main
git reset --hard origin/main
```

(Traduzindo: cria uma branch com o que você fez, sobe ela, e a `main` local volta a ser igual à oficial.) Daí é só abrir o PR normalmente. Ou pede pro Claude Code: *"commitei na main sem querer, move pra uma branch e deixa a main local igual à origin"*.

## Quebrou no ar? (como desfazer)

1. Abre o PR que causou o problema (tá no histórico da `main`).
2. Clica no botão **"Revert"** — o GitHub abre um PR novo desfazendo aquela melhoria.
3. O robô comenta o preview do revert — dá pra conferir que o jogo voltou ao normal **antes** de publicar.
4. O outro aprova → merge → em ~1 minuto o jogo oficial volta.

Emergência de verdade (jogo quebrado no ar e o outro inacessível): o Luiz, como dono do repo, pode desmarcar temporariamente o "Do not allow bypassing" nas configurações, mergear o revert sozinho e marcar de novo — sempre avisando no grupo. (Sem o Luiz não existe esse atalho: proteção ativa vale pros dois.)

## Proteção da `main` (o Luiz configura UMA vez, DEPOIS que este guia entrar na `main`)

Pra o GitHub **garantir** essas regras (em vez de depender de disciplina), o Luiz — dono do repo — ativa a proteção da `main`:

Atenção: o GitHub vai te oferecer **"Add branch ruleset"** com destaque — **ignora esse**. Procura o botão/link **"Add classic branch protection rule"** (é outro formulário, e é o que bate com os passos abaixo).

1. No site do repositório: **Settings → Branches → Add classic branch protection rule**
2. Em "Branch name pattern", escreve: `main`
3. Marca **"Require a pull request before merging"** e, dentro dela:
   - **"Require approvals"** com **1** aprovação
   - **"Dismiss stale pull request approvals when new commits are pushed"** (push novo derruba a aprovação antiga — o outro sempre revê a versão final)
   - **"Require approval of the most recent reviewable push"** (quem deu o último push não pode ser o único a aprovar)
4. Marca **"Require status checks to pass before merging"**, busca e seleciona **`comentar-preview`**, e dentro dela marca **"Require branches to be up to date before merging"** (o GitHub passa a exigir o "Update branch" quando a `main` andou — nada mergeia defasado). Se `comentar-preview` não aparecer na busca, é porque o robô não rodou nos últimos dias: abre um PR de teste qualquer (pode fechar sem mergear), espera o robô comentar nele, e volta aqui — agora aparece.
5. Marca **"Do not allow bypassing the above settings"** (vale pra todo mundo, inclusive o dono)
6. Clica em **"Create"**

Com isso o GitHub passa a **bloquear fisicamente** push direto e force-push na `main`, pros dois. Toda melhoria só entra por PR, aprovado pelo outro **na versão final** — que é exatamente o combinado.
