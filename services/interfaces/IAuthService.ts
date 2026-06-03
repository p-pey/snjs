import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from "@/schemas/auth.schema";
import type { UserSession } from "@/types/app.types";

export interface IAuthService {
  login(data: LoginInput): Promise<UserSession>;
  signup(data: SignupInput): Promise<UserSession>;
  logout(): Promise<void>;
  forgotPassword(data: ForgotPasswordInput): Promise<void>;
  resetPassword(data: ResetPasswordInput): Promise<void>;
  getSession(): Promise<UserSession | null>;
}
