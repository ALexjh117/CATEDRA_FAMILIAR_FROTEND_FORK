# Store

State management global con Zustand (cuando se instale).

## Estructura:
- `auth.store.ts` - Estado de autenticación
- `user.store.ts` - Datos del usuario actual
- `ui.store.ts` - Estado de UI (modales, sidebars, etc.)

## Ejemplo:
```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false })
}));
```
