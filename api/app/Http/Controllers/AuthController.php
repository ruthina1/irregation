<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Token authentication for the web client (endpoints under /api/v1/umac,
 * matching web/src/services/api/authApi.js).
 */
class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'The provided credentials are incorrect.']);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'message' => 'Signed in successfully.',
            'data' => ['user' => $user->toAuthPayload(), 'token' => $token],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->toAuthPayload()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Signed out successfully.']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string', 'current_password:sanctum'],
            'new_password' => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        $request->user()->forceFill(['password' => $data['new_password']])->save();

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
