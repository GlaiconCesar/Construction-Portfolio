# Salon Privé – Construction Breakdown (EN/PT)

Static bilingual case study page for GitHub Pages.

## Estrutura

- `index.html`
- `assets/css/styles.css`
- `assets/js/i18n.js` (dicionário EN/PT no próprio arquivo)
- `assets/img/*` (galeria local)
- `assets/SalonPrive-CaseStudy.pdf`

Sem build step, sem framework, sem backend.

## Preview local

```bash
python3 -m http.server 8000
```

Acesse:

- `http://localhost:8000/` (EN padrão)
- `http://localhost:8000/?lang=pt` (força PT)

## Idioma

- Padrão: **English**.
- `?lang=pt` e `?lang=en` têm prioridade sobre `localStorage`.
- Sem query param, usa `localStorage.preferredLanguage`.
- O switch EN/PT troca todo o conteúdo e persiste a escolha.

## Usando as fotos anexadas

A página já está preparada para carregar as fotos reais da galeria por estes nomes (JPEG):

- `assets/img/salonprive-01.jpg`
- `assets/img/salonprive-02.jpg`
- `assets/img/salonprive-03.jpg`
- `assets/img/salonprive-04.jpg`
- `assets/img/salonprive-05.jpg`
- `assets/img/salonprive-06.jpg`
- `assets/img/salonprive-07.jpg`

Enquanto esses arquivos não existirem, a página usa fallback local em SVG automaticamente.

## PDF

Arquivo placeholder disponível em:

- `assets/SalonPrive-CaseStudy.pdf`

Substitua pelo PDF final quando estiver pronto.
