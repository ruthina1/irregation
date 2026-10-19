<?php

namespace Modules\Irrigation\Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Generic create / list / show / update / patch / delete behaviour for every
 * creatable Irrigation sub-resource.
 */
class IrrigationCrudTest extends IrrigationTestCase
{
    public static function creatableResources(): array
    {
        return array_combine(IrrigationPayloads::CREATABLE, array_map(fn ($r) => [$r], IrrigationPayloads::CREATABLE));
    }

    #[DataProvider('creatableResources')]
    public function test_full_crud_lifecycle(string $resource): void
    {
        $def = IrrigationFeatures::definition($resource);
        $created = $this->make($resource);

        $this->assertIsInt($created['id']);
        $this->assertSame('2019 E.C.', $created['fiscal_year']);
        if ($status = $def['status'] ?? null) {
            $this->assertContains($created[$status['field']], $status['values']);
        }

        // list, filtered by fiscal year — returned as { data: [...] }
        $this->api('GET', $resource.'?fiscal_year=2019%20E.C.')->assertOk()
            ->assertJsonPath('data.0.id', $created['id']);
        $this->api('GET', $resource.'?fiscal_year=2017%20E.C.')->assertOk()->assertJsonCount(0, 'data');

        $this->api('GET', "{$resource}/{$created['id']}")->assertOk()->assertJsonPath('data.id', $created['id']);

        // PUT with the full payload
        $payload = array_merge(IrrigationPayloads::for($resource, $this), [
            $def['code'] ?? 'unused' => $created[$def['code'] ?? 'id'] ?? null,
        ]);
        unset($payload['unused']);
        foreach (['contract_id', 'project_id', 'wua_id'] as $parent) {
            if (array_key_exists($parent, $created)) {
                $payload[$parent] = $created[$parent];
            }
        }
        $this->api('PUT', "{$resource}/{$created['id']}", $payload)->assertOk();

        // PATCH only the workflow status
        if (($status = $def['status'] ?? null) && empty($status['server'])) {
            $next = end($status['values']);
            $this->api('PATCH', "{$resource}/{$created['id']}", [$status['field'] => $next])
                ->assertOk()->assertJsonPath('data.'.$status['field'], $next);
            $this->api('PATCH', "{$resource}/{$created['id']}", [$status['field'] => 'Not a status'])
                ->assertUnprocessable()->assertJsonValidationErrors($status['field']);
        }

        $this->api('DELETE', "{$resource}/{$created['id']}")->assertOk();
        $this->api('GET', "{$resource}/{$created['id']}")->assertNotFound();
    }

    #[DataProvider('creatableResources')]
    public function test_create_validates_required_fields(string $resource): void
    {
        $response = $this->api('POST', $resource, [])->assertUnprocessable();

        $this->assertNotEmpty($response->json('errors'));
        $this->assertIsString($response->json('message'));
    }

    public function test_record_codes_must_be_unique_per_resource(): void
    {
        $first = $this->make('pipeline');

        $this->api('POST', 'pipeline', array_merge(IrrigationPayloads::for('pipeline', $this), ['pipeline_code' => $first['pipeline_code']]))
            ->assertUnprocessable()->assertJsonValidationErrors('pipeline_code');

        // A deleted record frees its code.
        $this->api('DELETE', "pipeline/{$first['id']}")->assertOk();
        $this->make('pipeline', ['pipeline_code' => $first['pipeline_code']]);
    }

    public function test_listing_supports_search_status_and_pagination(): void
    {
        $this->make('pipeline', ['scheme_name' => 'Gumara Diversion', 'zone' => 'South Gondar']);
        $this->make('pipeline', ['scheme_name' => 'Ribb Dam Canal']);
        $this->make('pipeline', ['scheme_name' => 'Megech Pump']);

        $this->api('GET', 'pipeline?search=Gumara')->assertOk()->assertJsonCount(1, 'data');
        $this->api('GET', 'pipeline?zone=South%20Gondar')->assertOk()->assertJsonCount(1, 'data');
        $this->api('GET', 'pipeline?status=Initial%20Pipeline%20Identification')->assertOk()->assertJsonCount(3, 'data');
        $this->api('GET', 'pipeline?per_page=2')->assertOk()
            ->assertJsonCount(2, 'data')->assertJsonPath('meta.total', 3)->assertJsonPath('meta.last_page', 2);
        $this->api('GET', 'pipeline?fiscal_year=bad')->assertUnprocessable();
    }

    public function test_unsupported_operations_return_405(): void
    {
        $this->api('POST', 'construction-ready', [])->assertStatus(405);
        $this->api('POST', 'institutions/assessment-audit', [])->assertStatus(405);
    }

    public function test_server_managed_fields_cannot_be_overwritten_by_clients(): void
    {
        $input = $this->make('inputs');

        $this->api('PUT', "inputs/{$input['id']}", array_merge(IrrigationPayloads::for('inputs', $this), [
            'input_code' => $input['input_code'], 'distributed_qty' => 9999, 'dispatch_history' => [['qty' => 1]], 'status' => 'Completed',
        ]))->assertOk()
            ->assertJsonPath('data.distributed_qty', 0)
            ->assertJsonPath('data.dispatch_history', [])
            ->assertJsonPath('data.status', 'Pending');
    }
}
