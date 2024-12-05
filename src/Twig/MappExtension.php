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

    public function __construct(SystemConfigService $systemConfigService, DalDealer $dalDealer) {
        $this->systemConfigService = $systemConfigService;
        $this->dalDealer = $dalDealer;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getCategoryNames', [$this, 'getCategoryNames']),
            new TwigFunction('getPageNumber', [$this, 'getPageNumber']),
            new TwigFunction('mappInclude', [$this, 'mappInclude'], ['needs_context' => true]),
            new TwigFunction('getVersion', [$this, 'getVersion']),
            new TwigFunction('getGender', [$this, 'getGender']),
            new TwigFunction('getAge', [$this, 'getAge']),
            new TwigFunction('getSoldOutStatus', [$this, 'getSoldOutStatus'])
        ];
    }

    public function getCategoryNames($ids)
    {
        return $this->dalDealer->getCategoryNames($ids);
    }

    public function getGender($genderKey)
    {
        switch ($genderKey) {
            case 'mr':
            case 'herr':
                return 1;
            case 'ms':
            case 'mrs':
            case 'miss':
            case 'frau':
                return 2;
            default:
                return 0;
        }
    }

    public function getAge($date) {
        $now = new \DateTime();
        return $now->diff($date)->format('%Y');
    }

    public function getSoldOutStatus($id)
    {
        return $this->dalDealer->getSoldOutStatus($id);
    }

    public function getPageNumber()
    {
        return "(function(){var r=/(?:\?|&)p=([0-9]+)(?:&|$)/;var h=r.exec(location.href);return ((h && h[1])?h[1]:'1')}())";
    }

    public function mappInclude($context, $dataLayerKey)
    {
        $salesChannelId = $context['context']->getSalesChannel()->getId();
        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        if(!isset($config['blacklist'])) {
            return true;
        } elseif (in_array($dataLayerKey, array_map('htmlspecialchars', explode(',', $config['blacklist'])))) {
            return false;
        }
        return true;
    }
    public static function getVersion()
    {
        return "1.3.0";
    }

}
