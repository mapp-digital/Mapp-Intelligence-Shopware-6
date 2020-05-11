<?php

namespace Mapp\MappIntelligence\Subscriber;

use Shopware\Core\System\SystemConfig\Exception\InvalidDomainException;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Storefront\Pagelet\Header\HeaderPageletLoadedEvent;
use Shopware\Core\Framework\Struct\ArrayEntity;
use Mapp\MappIntelligence\Services\DalDealer;

class HeaderSubscriber implements EventSubscriberInterface
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
        $route = $event->getRequest()->attributes->get('_route');
        $salesChannelId = $event->getSalesChannelContext()->getSalesChannel()->getId();
//        $systemConfig = $this->systemConfigService->getDomain('MappIntelligence', $salesChannelId);


        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        if(!isset($config['tiDomain'])) {
            $config['tiDomain'] = 'responder.wt-safetag.com';
        }

        $page = $event->getPagelet();
        $page->addExtension('tiLoader', new ArrayEntity($config));

        $data = array(
            '_ti' => $this->dalDealer->getData($event)
        );
        $page->addExtension('mappIntelligence', new ArrayEntity($data));
    }
}
