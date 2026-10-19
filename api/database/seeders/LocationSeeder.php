<?php

namespace Database\Seeders;

use App\Models\Kebele;
use App\Models\Woreda;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $zonesData = [
            [
                'name' => 'ባህር ዳር',
                'woredas' => [
                    ['name' => 'በላይ ዘለቀ', 'kebeles' => ['Kebele-01', 'Kebele-02', 'Kebele-03']],
                    ['name' => 'ዳግማዊ ሚኒሊክ', 'kebeles' => ['Kebele-04', 'Kebele-05']],
                    ['name' => 'ጊንቦት 20', 'kebeles' => ['Kebele-06', 'Kebele-07']],
                ],
            ],
            [
                'name' => 'Debub gonder',
                'woredas' => [
                    ['name' => 'ደብረ ታቦር', 'kebeles' => ['Kebele-01', 'Kebele-02']],
                    ['name' => 'ፎገራ', 'kebeles' => ['ኩሀር ሚካኤል', 'ወረታ ዙሪያ', 'አለበር']],
                    ['name' => 'ሊቦ ከምከም', 'kebeles' => ['ይፍራግ', 'አምቦሜዳ']],
                    ['name' => 'ድርማ', 'kebeles' => ['አባ ቆስጢንዶስ', 'ማርያም ደብር']],
                ],
            ],
            [
                'name' => 'Semen Gondar',
                'woredas' => [
                    ['name' => 'ደባርቅ', 'kebeles' => ['ደባርቅ 01', 'ደባርቅ 02']],
                    ['name' => 'ዳባት', 'kebeles' => ['ዳባት 01', 'ዉጨት']],
                ],
            ],
            [
                'name' => 'Misraq Gojjam',
                'woredas' => [
                    ['name' => 'ደብረ ማርቆስ', 'kebeles' => ['ደብረ ማርቆስ 01', 'ደብረ ማርቆስ 02']],
                    ['name' => 'አነደድ', 'kebeles' => ['አነደድ ዙሪያ', 'ጉድላን']],
                    ['name' => 'አዋበል', 'kebeles' => ['ሉማሜ', 'አማንኤል ዙሪያ']],
                ],
            ],
            [
                'name' => 'Mirab Gojjam',
                'woredas' => [
                    ['name' => 'ፍኖተ ሰላም', 'kebeles' => ['ፍኖተ ሰላም 01', 'ፍኖተ ሰላም 02']],
                    ['name' => 'ሜጫ', 'kebeles' => ['መርዓዊ', 'አዴት ዙሪያ', 'ወተት አባይ']],
                    ['name' => 'ቡሬ', 'kebeles' => ['ቡሬ 01', 'ቡሬ ዙሪያ']],
                ],
            ],
            [
                'name' => 'Semen Wollo',
                'woredas' => [
                    ['name' => 'ወልዲያ', 'kebeles' => ['ወልዲያ 01', 'ወልዲያ 02']],
                    ['name' => 'ኮቦ', 'kebeles' => ['ራያ ቆቦ', 'ጎቢዬ']],
                ],
            ],
            [
                'name' => 'Debub Wollo',
                'woredas' => [
                    ['name' => 'ደሴ', 'kebeles' => ['ደሴ 01', 'ደሴ 02', 'ሆቴል ዙሪያ']],
                    ['name' => 'ኮምቦልቻ', 'kebeles' => ['ኮምቦልቻ 01', 'ኮምቦልቻ 02']],
                    ['name' => 'ቃሉ', 'kebeles' => ['ሐርቡ', 'ደጎሎ']],
                ],
            ],
            [
                'name' => 'Semen Shewa',
                'woredas' => [
                    ['name' => 'ደብረ ብርሃን', 'kebeles' => ['ደብረ ብርሃን 01', 'ደብረ ብርሃን 02']],
                    ['name' => 'አንጎለላና ተራ', 'kebeles' => ['ጫቻ', 'አምቦ']],
                    ['name' => 'ባሶና ወራና', 'kebeles' => ['ባሶና', 'ደብረ ሲና']],
                ],
            ],
            [
                'name' => 'Awi',
                'woredas' => [
                    ['name' => 'እንጅባራ', 'kebeles' => ['እንጅባራ 01', 'እንጅባራ 02']],
                    ['name' => 'ዳንግላ', 'kebeles' => ['ዳንግላ 01', 'ኳሪት']],
                ],
            ],
            [
                'name' => 'Wag Hemra',
                'woredas' => [
                    ['name' => 'ሰቆጣ', 'kebeles' => ['ሰቆጣ 01', 'ሰቆጣ 02']],
                ],
            ],
        ];

        foreach ($zonesData as $zData) {
            $zone = Zone::firstOrCreate(['name' => $zData['name']]);
            foreach ($zData['woredas'] as $wData) {
                $woreda = Woreda::firstOrCreate(
                    ['zone_id' => $zone->id, 'name' => $wData['name']]
                );
                foreach ($wData['kebeles'] as $kebeleName) {
                    Kebele::firstOrCreate([
                        'woreda_id' => $woreda->id,
                        'name' => $kebeleName,
                    ]);
                }
            }
        }
    }
}
