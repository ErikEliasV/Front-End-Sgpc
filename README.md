# 🏗️ Obra Fácil - Sistema de Gerenciamento de Projetos de Construção

<div align="center">
  <img src="./assets/icon.png" alt="Obra Fácil Logo" width="120" height="120">
  
  **Sistema completo de gerenciamento de projetos de construção com controle de custos, tarefas e equipes**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.3-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-~53.0.11-black.svg)](https://expo.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## 📱 Sobre o Projeto

O **Obra Fácil** é um aplicativo mobile desenvolvido em React Native para gerenciamento completo de projetos de construção. O sistema oferece controle total sobre projetos, tarefas, equipes, materiais e custos, sendo ideal para empresas de construção civil, engenheiros e gerentes de projeto.

### 🎯 Principais Funcionalidades

- **👥 Gerenciamento de Usuários**: Controle completo de usuários com diferentes níveis de acesso (USER, MANAGER, ADMIN)
- **🏗️ Gestão de Projetos**: Criação, edição e acompanhamento de projetos com orçamento e prazos
- **✅ Controle de Tarefas**: Sistema Kanban para organização e acompanhamento de tarefas
- **💰 Gestão de Custos**: Controle detalhado de custos por projeto e tarefa
- **🔧 Catálogo de Serviços**: Biblioteca de serviços com custos padronizados
- **📦 Gerenciamento de Materiais**: Controle de estoque e solicitações de materiais
- **📊 Relatórios**: Dashboards e relatórios detalhados de progresso e custos
- **🔐 Autenticação Segura**: Sistema de login com JWT e diferentes níveis de permissão

---

## 🚀 Começando

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go** app no seu celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/Obra-Facil-Frontend.git
   cd Obra-Facil-Frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a API**
   
   O projeto está configurado para usar a API em produção:
   ```
   https://sgpc-api.koyeb.app/api
   ```
   
   Se necessário, altere a URL da API em `src/screens/*/index.js`

### 📱 Executando o Aplicativo

#### Para usar no celular via Expo Go:

```bash
npx expo start --tunnel
```

Este comando:
- Inicia o servidor de desenvolvimento
- Cria um túnel para acesso externo
- Gera um QR Code para escaneamento
- Permite acesso via Expo Go mesmo em redes diferentes

#### Outros comandos disponíveis:

```bash
# Desenvolvimento local
npm start

# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web
```

---

## 🏗️ Arquitetura do Projeto

```
ObraFacil/
├── 📁 assets/                    # Recursos visuais
│   ├── icon.png
│   ├── splash-icon.png
│   └── ...
├── 📁 src/
│   ├── 📁 components/            # Componentes reutilizáveis
│   │   ├── Button.js
│   │   ├── DatePicker.js
│   │   └── index.js
│   ├── 📁 routes/                # Navegação
│   │   ├── AppNavigator.js
│   │   ├── TabNavigator.js
│   │   └── index.js
│   └── 📁 screens/               # Telas do aplicativo
│       ├── 📁 Dashboard/         # Dashboard principal
│       ├── 📁 Login/             # Autenticação
│       ├── 📁 Register/          # Cadastro de usuários
│       ├── 📁 Projects/          # Gestão de projetos
│       ├── 📁 Tasks/             # Controle de tarefas
│       ├── 📁 CostManagement/    # Gestão de custos
│       ├── 📁 Materials/         # Gerenciamento de materiais
│       ├── 📁 UserManagement/    # Administração de usuários
│       └── ...
├── App.js                        # Componente principal
├── package.json                  # Dependências
└── README.md                     # Este arquivo
```

---

## 🎮 Como Usar

### 1. 🔐 **Login e Autenticação**

1. **Primeiro Acesso**: Registre-se como ADMIN
2. **Login**: Use suas credenciais para acessar
3. **Recuperação**: Use "Esqueci minha senha" se necessário

### 2. 👥 **Gerenciamento de Usuários** (ADMIN)

- **Criar Usuários**: Botão "+" no cabeçalho
- **Tipos de Usuário**:
  - **USER**: Acesso básico a tarefas
  - **MANAGER**: Gerencia projetos e equipes
  - **ADMIN**: Controle total do sistema
- **Ações**: Ativar/Desativar usuários

### 3. 🏗️ **Gestão de Projetos**

- **Criar Projeto**: Defina nome, descrição, orçamento e prazo
- **Adicionar Equipe**: Selecione membros da equipe
- **Auto-inclusão**: Criador é automaticamente adicionado à equipe
- **Acompanhamento**: Monitore progresso e custos

### 4. ✅ **Controle de Tarefas**

- **Sistema Kanban**: A Fazer → Em Andamento → Concluída
- **Atribuição**: Atribua tarefas apenas aos membros da equipe
- **Progresso**: Acompanhe percentual de conclusão
- **Prioridades**: Defina prioridades e prazos

### 5. 💰 **Gestão de Custos**

#### **Serviços**
- **Criar Serviços**: Defina custos de mão de obra, material e equipamento
- **Buscar**: Sistema de busca por nome
- **Reutilização**: Use serviços em múltiplos projetos

#### **Custos por Tarefa**
- **Adicionar Serviços**: Associe serviços às tarefas
- **Quantidades**: Defina quantidades específicas
- **Custos Customizados**: Sobrescreva custos padrão quando necessário
- **Cálculo Automático**: Custos são calculados automaticamente

#### **Relatórios**
- **Visão Geral**: Dashboard com resumo financeiro
- **Por Projeto**: Orçamento vs. Realizado
- **Por Tarefa**: Custos detalhados por tarefa
- **Indicadores**: Projetos acima do orçamento

### 6. 📦 **Materiais**

- **Catálogo**: Visualize materiais disponíveis
- **Solicitações**: Faça pedidos de materiais
- **Controle**: Gerencie estoque (funcionalidade futura)

---

## 🔧 Funcionalidades Técnicas

### 🔐 **Autenticação**
- JWT (JSON Web Tokens)
- Armazenamento seguro com AsyncStorage
- Renovação automática de tokens
- Diferentes níveis de permissão

### 🌐 **API Integration**
- RESTful API
- Tratamento de erros robusto
- Sistema de fallback para múltiplos endpoints
- Logs detalhados para debugging

### 📱 **Interface**
- Design responsivo
- Componentes reutilizáveis
- Navegação intuitiva
- Feedback visual para ações

### 🔄 **Sincronização**
- Recarregamento automático de dados
- Atualizações em tempo real
- Sistema de cache inteligente

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React Native**: Framework principal
- **Expo**: Plataforma de desenvolvimento
- **React Navigation**: Navegação entre telas
- **AsyncStorage**: Armazenamento local
- **Ionicons**: Ícones

### **Componentes Principais**
- **Modal**: Para formulários e detalhes
- **FlatList**: Listas otimizadas
- **TouchableOpacity**: Botões interativos
- **ScrollView**: Rolagem suave
- **ActivityIndicator**: Indicadores de carregamento

---

## 📊 Estrutura de Dados

### **Usuário**
```javascript
{
  id: number,
  name: string,
  email: string,
  roles: ["USER", "MANAGER", "ADMIN"],
  isActive: boolean,
  hourlyRate: number
}
```

### **Projeto**
```javascript
{
  id: number,
  name: string,
  description: string,
  budget: number,
  startDate: string,
  endDate: string,
  teamMembers: User[],
  tasks: Task[]
}
```

### **Tarefa**
```javascript
{
  id: number,
  title: string,
  description: string,
  status: "TODO" | "IN_PROGRESS" | "DONE",
  assignedTo: User,
  projectId: number,
  services: Service[],
  totalCost: number
}
```

### **Serviço**
```javascript
{
  id: number,
  name: string,
  description: string,
  unitOfMeasurement: string,
  unitLaborCost: number,
  unitMaterialCost: number,
  unitEquipmentCost: number,
  totalUnitCost: number
}
```

---

## 🔍 Debugging e Logs

O aplicativo possui sistema de logs detalhados:

```javascript
// Exemplos de logs
console.log('🔍 Carregando projetos...');
console.log('✅ Dados carregados com sucesso');
console.log('❌ Erro ao carregar dados:', error);
console.log('💰 Custo calculado:', totalCost);
```

### **Categorias de Logs**
- 🔍 **Carregamento**: Operações de busca
- ✅ **Sucesso**: Operações bem-sucedidas
- ❌ **Erro**: Falhas e exceções
- 💰 **Custos**: Cálculos financeiros
- 👥 **Usuários**: Operações de usuário
- 🏗️ **Projetos**: Gestão de projetos

---

## 🚨 Solução de Problemas

### **Problemas Comuns**

#### **1. Erro de Conexão**
```
Solução: Verifique sua conexão com a internet e se a API está online
```

#### **2. QR Code não funciona**
```bash
# Use o comando com tunnel
npx expo start --tunnel
```

#### **3. Custos não aparecem**
```
Solução: Use o botão "Atualizar" na aba de Tarefas
```

#### **4. Usuários não carregam**
```
Solução: Verifique se você tem permissão de ADMIN
```

### **Logs de Debug**
Para ativar logs detalhados, procure por:
```javascript
const DEBUG_ENABLED = true;
```

---

## 📈 Roadmap

### **Versão 1.1** (Próxima)
- [ ] Notificações push
- [ ] Modo offline
- [ ] Relatórios em PDF
- [ ] Gráficos avançados

### **Versão 1.2** (Futura)
- [ ] Chat interno
- [ ] Anexos de arquivos
- [ ] Integração com calendário
- [ ] Backup automático

### **Versão 2.0** (Longo prazo)
- [ ] Versão web
- [ ] API GraphQL
- [ ] Inteligência artificial
- [ ] Análise preditiva

---

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Desenvolvedor

**Desenvolvido com ❤️ para otimizar a gestão de projetos de construção**

---

## 🙏 Agradecimentos

- Comunidade React Native
- Equipe do Expo
- Contribuidores do projeto
- Usuários que fornecem feedback

---

<div align="center">
  <p><strong>Obra Fácil - Transformando a gestão de projetos de construção</strong></p>
  <p>⭐ Se este projeto foi útil para você, considere dar uma estrela!</p>
</div> 