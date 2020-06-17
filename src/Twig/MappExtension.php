<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Twig;

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Mapp\MappIntelligence\Services\DalDealer;
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

    public function __construct(
        SystemConfigService $systemConfigService,
        DalDealer $dalDealer
    )
    {
        $this->systemConfigService = $systemConfigService;
        $this->dalDealer = $dalDealer;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('getCategoryNames', [$this, 'getCategoryNames']),
            new TwigFunction('writeTiDataLayer', [$this, 'writeTiDataLayer'], ['needs_context' => true]),
            new TwigFunction('checkBlacklist', [$this, 'checkBlacklist'], ['needs_context' => true]),
        ];
    }

    public function getCategoryNames($ids) {
        return $this->dalDealer->getCategoryNames($ids);
    }

    public function writeTiDataLayer($context, $trackData) {
        $salesChannelId = $context['context']->getSalesChannel()->getId();
        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        $filter = false;
        if(isset($config['blacklist'])) {
            $filter = explode(',', $config['blacklist']);
        }
        $output = '<script type="text/javascript">';

        foreach ($trackData as $data) {
            $isJSON = isset($data['isJSON']);
            if($filter && (!in_array($data['key'], $filter))) {
                $output .= 'window._ti.' . $data['key'] . '=' . ($isJSON ? 'JSON.parse(' : '') . '\'' . $data['value'] . '\'' . ($isJSON ? ')' : '') . ';';
            }
        }

        return $output.= '</script>';
    }

    public function checkBlacklist($context, $key, $value) {
        $salesChannelId = $context['context']->getSalesChannel()->getId();
        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        $filter = false;
        if(isset($config['blacklist'])) {
            $filter = explode(',', $config['blacklist']);
        }
        if($filter && (in_array($key, $filter))) {
            return '""';
        }
        return $value;

    }

}
