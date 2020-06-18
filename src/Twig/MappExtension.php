<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Twig;

use Mapp\MappIntelligence\Services\DalDealer;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MappExtension extends AbstractExtension
{
    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    /**
    * @var DalDealer
    */
    private $dalDealer;

    private $config;

    public function __construct(SystemConfigService $systemConfigService, DalDealer $dalDealer) {
        $this->systemConfigService = $systemConfigService;
        $this->dalDealer = $dalDealer;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getCategoryNames', [$this, 'getCategoryNames']),
            new TwigFunction('mappInclude', [$this, 'mappInclude'], ['needs_context' => true]),
        ];
    }

    public function getCategoryNames($ids)
    {
        return $this->dalDealer->getCategoryNames($ids);
    }

    public function mappInclude($context, $dataLayerKey)
    {
        $salesChannelId = $context['context']->getSalesChannel()->getId();
        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        if(!isset($config['blacklist'])) {
            return true;
        } elseif (in_array($dataLayerKey, explode(',', $config['blacklist']))) {
            return false;
        }
        return true;
    }

}
