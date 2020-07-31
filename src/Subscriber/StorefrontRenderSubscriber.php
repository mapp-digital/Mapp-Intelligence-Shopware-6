<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Subscriber;

use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Event\StorefrontRenderEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;


class StorefrontRenderSubscriber implements EventSubscriberInterface
{
    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    public function __construct(
        SystemConfigService $systemConfigService
    )
    {
        $this->systemConfigService = $systemConfigService;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            StorefrontRenderEvent::class => 'onRender',
        ];
    }

    public function onRender(StorefrontRenderEvent $event): void
    {
        $salesChannelId = $event->getSalesChannelContext()->getSalesChannel()->getId();
        $config = $this->systemConfigService->get('MappIntelligence.config',  $salesChannelId);
        if(!isset($config['tiDomain'])) {
            $config['tiDomain'] = 'responder.wt-safetag.com';
        }
        if(!isset($config['tiId'])) {
            $config['tiId'] = '111111111111111';
        }

        //TODO make this configurable
        $config['v'] = 5;

        $event->setParameter(
            'mappIntelligence',
            $config
        );
    }
}
