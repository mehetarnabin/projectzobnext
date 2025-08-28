<?php

namespace App\Filament\Resources\JobPostResource\Widgets;

use Filament\Widgets\ChartWidget;

class JobPostGraphWidget extends ChartWidget
{
    protected static ?string $heading = 'Chart';

    protected function getData(): array
    {
        return [
            //
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
