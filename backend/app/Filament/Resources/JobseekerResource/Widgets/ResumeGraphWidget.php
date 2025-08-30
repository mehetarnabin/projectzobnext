<?php

namespace App\Filament\Resources\JobseekerResource\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Jobseeker; // Import your Jobseeker model

class ResumeGraphWidget extends ChartWidget
{
    protected static ?string $heading = 'Resumes Created';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        // Example: Count resumes per month
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $counts = [];

        foreach ($months as $index => $month) {
            $counts[] = Jobseeker::whereMonth('created_at', $index + 1)->count();
        }

        return [
            'labels' => $months,
            'datasets' => [
                [
                    'label' => 'Resumes',
                    'data' => $counts,
                ],
            ],
        ];
    }
}
