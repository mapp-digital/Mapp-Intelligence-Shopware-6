<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Twig;

use Mapp\MappIntelligence\Services\DalDealer;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MappExtension extends AbstractExtension
{
    /**
    * @var DalDealer
    */
    private $dalDealer;

    public function __construct(DalDealer $dalDealer) {
        $this->dalDealer = $dalDealer;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getCategoryNames', [$this, 'getCategoryNames'])
        ];
    }

    public function getCategoryNames($ids) {
        return $this->dalDealer->getCategoryNames($ids);
    }

}
