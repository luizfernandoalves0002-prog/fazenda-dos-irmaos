# Como colaborar no jogo Fazenda dos Irmãos

Esse é o projeto do jogo. Segue o passo a passo pra você conseguir acessar e mexer no código junto com o Luiz.

## 1. Aceitar o convite do repositório

O Luiz vai te adicionar como colaborador no GitHub. Você vai receber um convite (por e-mail ou uma notificação no próprio GitHub, no sininho no canto superior direito do site). Só precisa clicar em **"Accept invitation"**.

Repositório: https://github.com/luizfernandoalves0002-prog/fazenda-dos-irmaos

Jogo publicado (link pra testar/jogar): https://luizfernandoalves0002-prog.github.io/fazenda-dos-irmaos/

## 2. Baixar o projeto pro seu computador

Se você já tem o Git instalado, abre um terminal e roda:

```bash
git clone https://github.com/luizfernandoalves0002-prog/fazenda-dos-irmaos.git
```

Isso cria uma pasta `fazenda-dos-irmaos` no seu computador com o arquivo `index.html` (o jogo inteiro tá nesse único arquivo).

Se não tiver o Git, dá pra baixar zipado: no site do repositório, clica no botão verde **"Code" → "Download ZIP"**.

## 3. Abrir o projeto com o Claude Code

Abre a pasta `fazenda-dos-irmaos` no Claude Code (ou `claude` no terminal, dentro dessa pasta) e já pode pedir mudanças normalmente, tipo "adiciona tal coisa no jogo", "conserta tal bug" etc.

## 4. Testar o jogo antes de mandar mudança

Só abrir o `index.html` direto no navegador (duplo clique no arquivo) já funciona — é um jogo sem servidor, roda tudo local.

## 5. Mandar suas mudanças (commit + push)

Depois de mexer no `index.html` e testar, salva as mudanças assim:

```bash
git add index.html
git commit -m "descreve o que você mudou aqui"
git push
```

## 6. Antes de começar a editar, sempre puxa o que já mudou

Como os dois vão mexer no mesmo arquivo, pra evitar conflito é bom sempre rodar isso **antes** de começar a editar de novo:

```bash
git pull
```

## Dica importante pra não pisar no trabalho um do outro

Como é só um arquivo (`index.html`), se os dois editarem a mesma parte ao mesmo tempo pode dar conflito. O ideal é combinar por mensagem quem tá mexendo em quê antes de começar, ou revezar (um mexe, sobe (`push`), avisa o outro, o outro puxa (`pull`) e continua dali).
