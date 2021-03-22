<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Framework\Cookie;

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;

class CustomCookieProvider implements CookieProviderInterface {

    private $originalService;

    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    function __construct(CookieProviderInterface $service, SystemConfigService $systemConfigService)
    {
        $this->originalService = $service;
        $this->systemConfigService = $systemConfigService;
    }

    private $mappCookie = [
        'isRequired' => false,
        'snippet_name' => 'mapp.mappIntelligence.displayName',
        'snippet_description' => 'mapp.mappIntelligence.description',
        'cookie' => 'sw_MappIntelligence',
        'value'=> 1,
        'expiration' => '20000'
    ];


    public function getCookieGroups(): array
    {

        $config = $this->systemConfigService->get('MappIntelligence.config');
        if(isset($config['required']) && $config['required'] === true) {
            $this->mappCookie['isRequired'] = true;
        }
        if(isset($config['consent']) && $config['consent'] === false) {
            return array_merge(
                $this->originalService->getCookieGroups(),
                []
            );
        }
        return array_merge(
            $this->originalService->getCookieGroups(),
            [
                $this->mappCookie
            ]
        );
    }
}
