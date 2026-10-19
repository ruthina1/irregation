<?php

namespace Modules\Irrigation\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Modules\Irrigation\Database\Seeders\IrrigationDatabaseSeeder;
use Tests\TestCase;

abstract class IrrigationTestCase extends TestCase
{
    use RefreshDatabase;

    protected const FY = '2019 E.C.';

    protected User $officer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(IrrigationDatabaseSeeder::class);
        $this->officer = User::factory()->create(['name' => 'Irrigation Officer']);
        $this->officer->assignRole('Irrigation Officer');
        Sanctum::actingAs($this->officer);
    }

    protected function api(string $method, string $path, array $data = []): TestResponse
    {
        return $this->json($method, '/api/v1/irrigation/'.ltrim($path, '/'), $data);
    }

    /** Create a record through the API and return its JSON representation. */
    protected function make(string $resource, array $overrides = []): array
    {
        $payload = array_merge(IrrigationPayloads::for($resource, $this), $overrides);

        return $this->api('POST', $resource, $payload)->assertCreated()->json('data');
    }

    /** Create a parent record (used by payloads that need a parent id). */
    public function makeParent(string $resource): int
    {
        return $this->make($resource)['id'];
    }
}
