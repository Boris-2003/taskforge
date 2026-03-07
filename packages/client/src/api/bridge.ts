// bridge：API 层与 React 之间的通信桥梁
// API 函数（非 React 代码）通过这个模块触发全局 Toast 和认证过期跳转

type ToastType = 'success' | 'error' | 'warning';
type ToastFn = (type: ToastType, message: string) => void;
type AuthExpiredFn = () => void;

let _toast: ToastFn | null = null;
let _authExpired: AuthExpiredFn | null = null;

export const bridge = {
  /** 由 ToastContext 在挂载时注册 */
  registerToast(fn: ToastFn) {
    _toast = fn;
  },
  /** 由 App 在挂载时注册 */
  registerAuthExpired(fn: AuthExpiredFn) {
    _authExpired = fn;
  },
  toast(type: ToastType, message: string) {
    _toast?.(type, message);
  },
  authExpired() {
    _authExpired?.();
  },
};
