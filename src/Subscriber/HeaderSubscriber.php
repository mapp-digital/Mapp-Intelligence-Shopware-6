<?php

namespace Mapp\MappIntelligence\Subscriber;

use Shopware\Core\System\SystemConfig\Exception\InvalidDomainException;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Storefront\Pagelet\Header\HeaderPageletLoadedEvent;
use Shopware\Core\Framework\Struct\ArrayEntity;

class HeaderSubscriber implements EventSubscriberInterface
{
    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    public function __construct(SystemConfigService $systemConfigService)
    {
        $this->systemConfigService = $systemConfigService;
    }

    public static function getSubscribedEvents()
    {
        return [
            HeaderPageletLoadedEvent::CLASS => 'onHeaderLoaded'
        ];
    }

    /**
     * @param HeaderPageletLoadedEvent $event
     * @throws InvalidDomainException
     */
    public function onHeaderLoaded(HeaderPageletLoadedEvent $event)
    {
        $salesChannelId = $event->getSalesChannelContext()->getSalesChannel()->getId();
//        $systemConfig = $this->systemConfigService->getDomain('MappIntelligence', $salesChannelId);


        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        if(!isset($config['tiDomain'])) {
            $config['tiDomain'] = 'responder.wt-safetag.com';
        }


        $page = $event->getPagelet();

        $page->addExtension('tiLoader', new ArrayEntity($config));
    }
}
