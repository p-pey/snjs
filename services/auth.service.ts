import type { SupabaseClient } from "@supabase/supabase-js";
import type { IAuthService } from "@/services/interfaces/IAuthService";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from "@/schemas/auth.schema";
import { ServiceError, type UserSession } from "@/types/app.types";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

function toSession(user: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}): UserSession {
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? null,
  };
}

export class AuthService implements IAuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async login(data: LoginInput): Promise<UserSession> {
    const { data: result, error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new ServiceError(error.message, error.code);
    if (!result.user) throw new ServiceError("Login failed");
    return toSession(result.user);
  }

  async signup(data: SignupInput): Promise<UserSession> {
    const { data: result, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    });
    if (error) throw new ServiceError(error.message, error.code);
    if (!result.user) throw new ServiceError("Signup failed");
    return toSession(result.user);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new ServiceError(error.message, error.code);
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(
      data.email,
      { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password` },
    );
    if (error) throw new ServiceError(error.message, error.code);
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: data.password,
    });
    if (error) throw new ServiceError(error.message, error.code);
  }

  async getSession(): Promise<UserSession | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw new ServiceError(error.message, error.code);
    if (!data.user) return null;
    return toSession(data.user);
  }
}

export const authService = new AuthService(createClient());
