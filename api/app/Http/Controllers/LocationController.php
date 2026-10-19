<?php

namespace App\Http\Controllers;

use App\Models\Kebele;
use App\Models\Woreda;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // --- Zones ---

    public function getZones(): JsonResponse
    {
        $zones = Zone::withCount('woredas')->orderBy('name')->get();
        return response()->json($zones);
    }

    public function createZone(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        $zone = Zone::create($validated);
        return response()->json($zone, 201);
    }

    public function updateZone(Request $request, int $id): JsonResponse
    {
        $zone = Zone::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        $zone->update($validated);
        return response()->json($zone);
    }

    public function deleteZone(int $id): JsonResponse
    {
        $zone = Zone::findOrFail($id);
        $zone->delete();
        return response()->json(['message' => 'Zone deleted successfully.']);
    }

    // --- Woredas ---

    public function getWoredas(Request $request): JsonResponse
    {
        $query = Woreda::with('zone')->withCount('kebeles')->orderBy('name');

        if ($request->filled('zone_id')) {
            $query->where('zone_id', $request->query('zone_id'));
        }

        $woredas = $query->get();
        return response()->json($woredas);
    }

    public function createWoreda(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'zone_id' => 'required|exists:zones,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_food_insecure' => 'boolean',
        ]);

        $woreda = Woreda::create($validated);
        return response()->json($woreda->load('zone'), 201);
    }

    public function updateWoreda(Request $request, int $id): JsonResponse
    {
        $woreda = Woreda::findOrFail($id);
        $validated = $request->validate([
            'zone_id' => 'sometimes|required|exists:zones,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_food_insecure' => 'boolean',
        ]);

        $woreda->update($validated);
        return response()->json($woreda->load('zone'));
    }

    public function deleteWoreda(int $id): JsonResponse
    {
        $woreda = Woreda::findOrFail($id);
        $woreda->delete();
        return response()->json(['message' => 'Woreda deleted successfully.']);
    }

    // --- Kebeles ---

    public function getKebeles(Request $request): JsonResponse
    {
        $query = Kebele::with('woreda.zone')->orderBy('name');

        if ($request->filled('woreda_id')) {
            $query->where('woreda_id', $request->query('woreda_id'));
        }

        $kebeles = $query->get();
        return response()->json($kebeles);
    }

    public function createKebele(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'woreda_id' => 'required|exists:woredas,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'total_area_ha' => 'nullable|numeric',
            'arable_land_area_ha' => 'nullable|numeric',
            'elevation_meters' => 'nullable|integer',
            'ecology_type' => 'nullable|string|max:100',
            'average_annual_rainfall_mm' => 'nullable|numeric',
        ]);

        $kebele = Kebele::create($validated);
        return response()->json($kebele->load('woreda.zone'), 201);
    }

    public function updateKebele(Request $request, int $id): JsonResponse
    {
        $kebele = Kebele::findOrFail($id);
        $validated = $request->validate([
            'woreda_id' => 'sometimes|required|exists:woredas,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'total_area_ha' => 'nullable|numeric',
            'arable_land_area_ha' => 'nullable|numeric',
            'elevation_meters' => 'nullable|integer',
            'ecology_type' => 'nullable|string|max:100',
            'average_annual_rainfall_mm' => 'nullable|numeric',
        ]);

        $kebele->update($validated);
        return response()->json($kebele->load('woreda.zone'));
    }

    public function deleteKebele(int $id): JsonResponse
    {
        $kebele = Kebele::findOrFail($id);
        $kebele->delete();
        return response()->json(['message' => 'Kebele deleted successfully.']);
    }
}
