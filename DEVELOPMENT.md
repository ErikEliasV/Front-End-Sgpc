# 🛠️ Guia de Desenvolvimento - Obra Fácil

Este documento contém informações técnicas detalhadas para desenvolvedores que desejam contribuir com o projeto Obra Fácil.

## 📋 Estrutura de Desenvolvimento

### 🎯 Padrões de Código

#### **Nomenclatura**
- **Componentes**: PascalCase (`UserManagement`, `CostManagement`)
- **Funções**: camelCase (`loadProjects`, `handleSubmit`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEBUG_ENABLED`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários

#### **Estrutura de Arquivos**
```
src/screens/[ScreenName]/
├── index.js          # Componente principal
├── styles.js         # Estilos (se separado)
└── components/       # Componentes específicos da tela
```

### 🔧 Configuração da API

#### **URLs Base**
```javascript
const API_BASE = 'https://sgpc-api.koyeb.app/api';
```

#### **Endpoints Principais**
- **Autenticação**: `/auth/login`, `/auth/register`
- **Usuários**: `/users`, `/users/active`, `/users/admin/create`
- **Projetos**: `/projects`, `/projects/{id}/team`
- **Tarefas**: `/tasks`, `/projects/{id}/tasks/kanban`
- **Serviços**: `/services`, `/services/search`
- **Custos**: `/tasks/{id}/report`, `/tasks/{id}/services`

### 🔐 Sistema de Autenticação

#### **Token JWT**
```javascript
// Armazenamento
await AsyncStorage.setItem('userToken', token);

// Recuperação
const token = await AsyncStorage.getItem('userToken');

// Headers de autenticação
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

#### **Níveis de Permissão**
- **USER**: Acesso básico a tarefas
- **MANAGER**: Gestão de projetos e equipes
- **ADMIN**: Controle total do sistema

### 📱 Componentes Reutilizáveis

#### **Button Component**
```javascript
import { Button } from '../components';

<Button 
  title="Salvar"
  onPress={handleSave}
  style={styles.saveButton}
/>
```

#### **DatePicker Component**
```javascript
import { DatePicker } from '../components';

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Selecione a data"
/>
```

### 🎨 Sistema de Estilos

#### **Cores Padrão**
```javascript
const colors = {
  primary: '#007AFF',
  success: '#28a745',
  warning: '#f39c12',
  danger: '#dc3545',
  secondary: '#6c757d',
  light: '#f8f9fa',
  dark: '#343a40'
};
```

#### **Padrões de Layout**
```javascript
const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  }
};
```

### 🔄 Gerenciamento de Estado

#### **Estados Locais**
```javascript
// Dados
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(false);

// Modais
const [showModal, setShowModal] = useState(false);

// Formulários
const [formData, setFormData] = useState({
  name: '',
  description: ''
});
```

#### **AsyncStorage para Persistência**
```javascript
// Salvar dados do usuário
await AsyncStorage.setItem('userData', JSON.stringify(user));

// Recuperar dados do usuário
const userData = await AsyncStorage.getItem('userData');
const user = userData ? JSON.parse(userData) : null;
```

### 🐛 Sistema de Debug

#### **Logs Categorizados**
```javascript
// Carregamento
console.log('🔍 Carregando dados...');

// Sucesso
console.log('✅ Operação realizada com sucesso');

// Erro
console.error('❌ Erro:', error);

// Custos
console.log('💰 Custo calculado:', value);

// Usuários
console.log('👥 Usuário logado:', user.name);
```

#### **Debug Condicional**
```javascript
const DEBUG_ENABLED = __DEV__;

if (DEBUG_ENABLED) {
  console.log('Debug info:', data);
}
```

### 🚀 Otimizações de Performance

#### **Lazy Loading**
```javascript
// Carregar dados apenas quando necessário
useEffect(() => {
  if (activeTab === 'projects') {
    loadProjects();
  }
}, [activeTab]);
```

#### **Memoização**
```javascript
const memoizedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### 🧪 Testes

#### **Estrutura de Testes**
```
__tests__/
├── components/
│   ├── Button.test.js
│   └── DatePicker.test.js
├── screens/
│   ├── Login.test.js
│   └── Projects.test.js
└── utils/
    └── api.test.js
```

#### **Exemplo de Teste**
```javascript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../src/components/Button';

test('should call onPress when button is pressed', () => {
  const mockOnPress = jest.fn();
  const { getByText } = render(
    <Button title="Test" onPress={mockOnPress} />
  );
  
  fireEvent.press(getByText('Test'));
  expect(mockOnPress).toHaveBeenCalled();
});
```

### 🔧 Configurações do Expo

#### **app.json**
```json
{
   "expo": {
     "name": "Obra Fácil",
     "slug": "obra-facil",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true
  }
}
```

#### **Comandos Úteis**
```bash
# Desenvolvimento
npx expo start --tunnel    # Para acesso externo
npx expo start --clear     # Limpar cache

# Build
npx expo build:android     # Build Android
npx expo build:ios         # Build iOS

# Publicação
npx expo publish           # Publicar update
```

### 📊 Monitoramento e Analytics

#### **Logs de Erro**
```javascript
try {
  await apiCall();
} catch (error) {
  console.error('API Error:', {
    endpoint: '/api/endpoint',
    error: error.message,
    timestamp: new Date().toISOString()
  });
}
```

#### **Métricas de Performance**
```javascript
const startTime = Date.now();
await loadData();
const loadTime = Date.now() - startTime;
console.log(`Load time: ${loadTime}ms`);
```

### 🔄 Fluxo de Desenvolvimento

#### **1. Setup Inicial**
```bash
git clone <repo>
cd ObraFacil
npm install
npx expo start --tunnel
```

#### **2. Desenvolvimento de Feature**
```bash
git checkout -b feature/nova-funcionalidade
# Desenvolver...
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

#### **3. Code Review**
- Verificar padrões de código
- Testar funcionalidade
- Verificar logs de debug
- Confirmar responsividade

#### **4. Deploy**
```bash
git checkout main
git merge feature/nova-funcionalidade
npx expo publish
```

### 🚨 Troubleshooting Comum

#### **Metro Bundle Error**
```bash
npx expo start --clear
```

#### **Cache Issues**
```bash
npm start -- --reset-cache
```

#### **Dependencies Issues**
```bash
rm -rf node_modules
npm install
```

### 📝 Checklist para Pull Request

- [ ] Código segue padrões estabelecidos
- [ ] Logs de debug implementados
- [ ] Tratamento de erros adequado
- [ ] Interface responsiva
- [ ] Funcionalidade testada
- [ ] Documentação atualizada

### 🔗 Links Úteis

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

**Desenvolvido com ❤️ para a comunidade de desenvolvimento** 