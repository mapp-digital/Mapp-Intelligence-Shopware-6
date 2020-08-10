<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Framework\Cookie;

use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;

class CustomCookieProvider implements CookieProviderInterface {

    private $originalService;

    function __construct(CookieProviderInterface $service)
    {
        $this->originalService = $service;
    }

    private const singleCookie = [
        'snippet_name' => 'mapp.mappIntelligence.displayName',
        'snippet_description' => 'mapp.mappIntelligence.description',
        'cookie' => 'sw_MappIntelligence',
        'value'=> 1,
        'expiration' => '20000'
    ];


    public function getCookieGroups(): array
    {
        return array_merge(
            $this->originalService->getCookieGroups(),
            [
                self::singleCookie
            ]
        );
    }
}
