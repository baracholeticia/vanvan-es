# 🎨 Guia: Implementando Design System do Figma com Tailwind CSS

Este guia ensina como implementar componentes do design system do Figma usando Tailwind CSS no Angular.

## 📚 Índice

1. [Fluxo de trabalho](#fluxo-de-trabalho)
2. [Configurando cores e estilos](#configurando-cores-e-estilos)
3. [Criando componentes](#criando-componentes)
4. [Boas práticas](#boas-práticas)

---

## 🔄 Fluxo de trabalho

### 1. Analisando o Design no Figma

#### Passo 1: Abrir o Figma Dev Mode
- Clique em "Dev Mode" no canto superior direito do Figma
- Selecione o componente que deseja implementar
- Analise as propriedades no painel direito

#### Passo 2: Identificar as variantes
Procure por:
- **Estados**: Default, Hover, Active, Disabled, Focus
- **Tamanhos**: Small, Medium, Large
- **Variantes**: Primary, Secondary, Tertiary, etc.

#### Passo 3: Extrair valores de design
Copie os valores de:
- **Cores**: Background, Text, Border
- **Espaçamentos**: Padding, Margin, Gap
- **Tipografia**: Font family, size, weight, line-height
- **Bordas**: Border radius, border width
- **Sombras**: Box shadow

**Exemplo do botão Primary no Figma:**
```
Background: #F66B0E
Text: #FFFFFF
Padding: 24px (horizontal), 16px (vertical)
Border radius: 8px
Font: Google Sans Flex, Bold, 16px
Text transform: Uppercase
Letter spacing: 0.15px (ou 3px no design)
```

---

## ⚙️ Configurando cores e estilos

### 1. Adicionar cores no `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Cores extraídas do Figma
        "primary": "#F66B0E",      // Cor principal
        "secondary": "#557D96",    // Cor secundária
        "tertiary": "#E1C69A",     // Cor terciária
        "dark": "#353535",         // Texto escuro
        "text": "#112B3C",         // Texto padrão
        "subtle-text": "#646464",  // Texto sutil
        "accent": "#B1B1B1",       // Detalhes
        "light": "#EEEEEF",        // Fundo claro
        "success": "#31D0AA",      // Sucesso
      },
    },
  },
}
```

### 2. Adicionar tipografia

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        "google-sans-flex": "Google Sans Flex",
        sans: ['"Google Sans Flex"', 'sans-serif'],
      },
      fontSize: {
        'button-text': ['1rem', {
          lineHeight: 'normal',
          fontWeight: '700',
          letterSpacing: '0.04rem',  // Converta de px para rem
          textTransform: 'uppercase',
        }],
      },
    },
  },
}
```

### 3. Adicionar sombras (se necessário)

```javascript
boxShadow: {
  "primary": "0px 4px 10px rgba(102, 138, 161, 0.1)",
  "secondary": "0px 4px 10px rgba(246, 107, 14, 0.3)",
},
```

---

## 🧩 Criando componentes

### 1. Estrutura do componente

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buttons.html',
  styleUrl: './buttons.css',
})
export class Buttons {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  
  get buttonClasses(): string {
    // Implementação dinâmica das classes
  }
}
```

### 2. Mapeando estados para classes Tailwind

#### Classes base (aplicadas a todos os botões):
```typescript
const baseClasses = 'font-google-sans-flex font-bold uppercase rounded-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2';
```

#### Classes por tamanho:
```typescript
const sizeClasses = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-4 text-button-text',
  large: 'px-8 py-5 text-lg'
};
```

#### Classes por variante:
```typescript
const variantClasses = {
  primary: this.disabled 
    ? 'bg-light text-subtle-text cursor-not-allowed opacity-40' 
    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-secondary active:bg-primary/80',
  secondary: this.disabled
    ? 'bg-light text-subtle-text cursor-not-allowed opacity-40'
    : 'bg-secondary text-white hover:bg-secondary/90 hover:shadow-primary active:bg-secondary/80',
  tertiary: this.disabled
    ? 'bg-light text-subtle-text cursor-not-allowed opacity-40'
    : 'bg-tertiary text-dark hover:bg-tertiary/90 active:bg-tertiary/80'
};
```

### 3. Template HTML

```html
<button 
  [class]="buttonClasses"
  [disabled]="disabled"
  type="button">
  <ng-content></ng-content>
</button>
```

### 4. Uso do componente

```html
<!-- Botão primary padrão -->
<app-buttons variant="primary">Salvar</app-buttons>

<!-- Botão secondary pequeno -->
<app-buttons variant="secondary" size="small">Cancelar</app-buttons>

<!-- Botão desabilitado -->
<app-buttons variant="primary" [disabled]="true">Desabilitado</app-buttons>
```

---

## 📋 Boas práticas

### 1. ✅ Conversão de unidades

**Figma → Tailwind:**
- Pixels de espaçamento: Use escala do Tailwind (4px = 1 unit)
  - `8px` → `2` (p-2, px-2, etc.)
  - `16px` → `4` (p-4, px-4, etc.)
  - `24px` → `6` (p-6, px-6, etc.)

- Letter spacing: Converta px para rem ou em
  - `3px` → `0.1875rem` ou `3/16 = 0.1875`
  - Ou adicione no config: `letterSpacing: { 'button': '0.1875rem' }`

### 2. ✅ Estados interativos

Use modifiers do Tailwind:
- `hover:` - Estado de hover
- `active:` - Estado quando pressionado
- `focus:` - Estado quando focado
- `disabled:` - Estado desabilitado

```html
<!-- Exemplo completo de estados -->
<button class="
  bg-primary 
  hover:bg-primary/90 
  active:bg-primary/80 
  focus:ring-2 
  focus:ring-primary 
  disabled:opacity-40 
  disabled:cursor-not-allowed
">
  Botão
</button>
```

### 3. ✅ Opacidade

Use `/` para aplicar opacidade:
- `bg-primary/90` = 90% de opacidade
- `bg-primary/80` = 80% de opacidade
- `bg-primary/50` = 50% de opacidade

### 4. ✅ Transições suaves

Sempre adicione transições para estados interativos:
```html
<button class="transition-all duration-200 hover:scale-105">
  Botão com animação
</button>
```

### 5. ✅ Acessibilidade

- Sempre adicione `type="button"` em botões que não são submit
- Use `[disabled]` quando o botão estiver desabilitado
- Adicione `aria-label` para ícones sem texto
- Use cores com contraste adequado (WCAG AA mínimo)

### 6. ✅ Consistência

- Use as cores do design system definidas no Tailwind config
- Não use cores hard-coded no HTML
- Mantenha os tamanhos consistentes (use a escala definida)

---

## 🎯 Checklist de implementação

Ao implementar um novo componente do Figma:

- [ ] Analisei todas as variantes no Figma
- [ ] Identifiquei todos os estados (hover, active, disabled, etc.)
- [ ] Extraí todas as cores usadas
- [ ] Adicionei as cores no tailwind.config.js
- [ ] Configurei a tipografia no tailwind.config.js
- [ ] Criei os tipos TypeScript para as variantes
- [ ] Implementei todas as variantes no componente
- [ ] Adicionei estados interativos (hover, active, etc.)
- [ ] Testei todos os tamanhos
- [ ] Testei o estado desabilitado
- [ ] Verifiquei a acessibilidade
- [ ] Comparei visualmente com o design do Figma

---

## 🔍 Exemplo completo: Botão do zero

### Passo a passo completo:

#### 1. Análise no Figma
Abra o componente "Button/Primary" e copie:
- Background: `#F66B0E`
- Text: `#FFFFFF`
- Padding: `24px 16px`
- Border radius: `8px`
- Font: `Google Sans Flex Bold 16px`

#### 2. Configure o Tailwind
```javascript
// tailwind.config.js
colors: {
  "primary": "#F66B0E",
}
```

#### 3. Crie o componente
```typescript
// button.ts
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      class="
        bg-primary 
        text-white 
        px-6 
        py-4 
        rounded-lg 
        font-bold 
        uppercase 
        hover:bg-primary/90 
        active:bg-primary/80
        transition-all 
        duration-200
      ">
      <ng-content></ng-content>
    </button>
  `
})
export class Button {}
```

#### 4. Use o componente
```html
<app-button>Meu Botão</app-button>
```

---

## 🚀 Próximos passos

Agora que você sabe implementar botões, aplique o mesmo processo para:
1. Inputs de formulário
2. Cards
3. Modais
4. Navegação
5. Badges e tags
6. Tooltips

---

## 📚 Recursos úteis

- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind CSS IntelliSense (VS Code)](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Design do Figma](https://www.figma.com/design/tTfBYKwV9gLM68pBEufk0c/VanVan%C2%B4s-Design)

---

**Criado para o projeto VanVan**
*Implementação: Fevereiro 2026*
