<?php

namespace Modules\Irrigation\Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

class IrrigationAccessTest extends IrrigationTestCase
{
    public function test_guests_are_rejected(): void
    {
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/irrigation/pipeline')->assertUnauthorized()->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_users_without_the_irrigation_permission_are_forbidden(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->api('GET', 'pipeline')->assertForbidden();
        $this->api('POST', 'pipeline', IrrigationPayloads::for('pipeline', $this))->assertForbidden();
    }

    public function test_super_admin_bypasses_the_permission_check(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('SuperAdmin', 'web'));
        Sanctum::actingAs($admin);

        $this->api('GET', 'pipeline')->assertOk();
    }

    public function test_login_returns_token_roles_and_permissions_in_the_web_client_shape(): void
    {
        $this->app['auth']->forgetGuards();
        $user = User::factory()->create(['email' => 'officer@example.test', 'password' => 'secret-pass-1']);
        $user->assignRole('Irrigation Officer');

        $token = $this->postJson('/api/v1/umac/login', ['email' => 'officer@example.test', 'password' => 'secret-pass-1'])
            ->assertOk()
            ->assertJsonPath('data.user.roles.0.name', 'Irrigation Officer')
            ->assertJsonPath('data.user.permission_list', ['manage-watersheds'])
            ->json('data.token');

        $this->withToken($token)->getJson('/api/v1/irrigation/pipeline')->assertOk();
        $this->postJson('/api/v1/umac/login', ['email' => 'officer@example.test', 'password' => 'wrong'])->assertUnprocessable();
    }

    public function test_unknown_resources_and_reports_return_404(): void
    {
        $this->api('GET', 'not-a-resource')->assertNotFound();
        $this->api('GET', 'reports/not-a-report')->assertNotFound();
        $this->api('GET', 'pipeline/999999')->assertNotFound()->assertJson(['message' => 'Record not found.']);
    }
}
