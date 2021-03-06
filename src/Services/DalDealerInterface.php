<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Services;

interface DalDealerInterface
{

    public function getData($event): ?string;
    public function getCategoryNames($categoryIds): ?array;
    public function getSoldOutStatus($id): string;

}
