<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Subscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Mapp\MappIntelligence\Services\DalDealer;

class KernelEventsSubscriber implements EventSubscriberInterface
{
    const COOKIE = "sw6_mappIntelligence";

    /**
     * @var DalDealer
     */
    private $dalDealer;

    private $dataLayer;

    private $template =  <<<EOD
{% verbatim %}{"ecommerce":{"add":{"products":[{% endverbatim %}{% for item in getparam('lineItems') %}{% verbatim %}{"variant":"{% endverbatim %}{{ getvariantdescription(item.id) }}{% verbatim %}","price":"{% endverbatim %}{{ cartaddprice(item.id, item.quantity, item.type, item.referencedId, item.stackable, item.removable) }}{% verbatim %}","category":"{% endverbatim %}{{ dbquery('name', 'category_translation', {'category_id =': dbquery('category_id', 'product_category', {'product_id =': dbquery('IF(parent_id IS NULL, id, parent_id)', 'product', {'id =': item.id|uuid2bytes})}, {'(SELECT level FROM category WHERE product_category.category_id = category.id)': 'DESC'})}, {('IF(language_id = \"%s\", 1, 0)'|format(languageid())): 'DESC'}) }}{% verbatim %}","brand":"{% endverbatim %}{{ dbquery('name', 'product_manufacturer_translation', {'product_manufacturer_id =': dbquery('product_manufacturer_id', 'product', {'id =': dbquery('IF(parent_id IS NULL, id, parent_id)', 'product', {'id =': item.id|uuid2bytes})})}, {('IF(language_id = \"%s\", 1, 0)'|format(languageid())): 'DESC'}) }}{% verbatim %}","id":"{% endverbatim %}{{ dbquery('product_number', 'product', {'id =': item.id|uuid2bytes}) }}{% verbatim %}","quantity":"{% endverbatim %}{{ item.quantity }}{% verbatim %}","name":"{% endverbatim %}{{ dbquery('name', 'product_translation', {'product_id =': dbquery('IF(parent_id IS NULL, id, parent_id)', 'product', {'id =': item.id|uuid2bytes})}, {('IF(language_id = \"%s\", 1, 0)'|format(languageid())): 'DESC'}) }}{% verbatim %}"}{% endverbatim %}{% if not loop.last %},{% endif %}{% endfor %}{% verbatim %}]},"currencyCode":"{% endverbatim %}{{ currencyiso() }}{% verbatim %}"},"event":"{% endverbatim %}addToCart{% verbatim %}"}{% endverbatim %}
EOD;



public function __construct(DalDealer $dalDealer) {
    $this->dalDealer = $dalDealer;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::CONTROLLER => [
                ['getDataLayerForXmlHttpRequest'],
            ],
            KernelEvents::RESPONSE => [
                ['prependDataLayerToResponse'],
            ],
        ];
    }

    public function getDataLayerForXmlHttpRequest(ControllerEvent $event): void
    {

//        $route = $event->getRequest()->attributes->get('_route');
//        $this->dataLayer = $this->dalDealer->getData($route, $event);

    }

    public function prependDataLayerToResponse(ResponseEvent $event): void
    {
        $response = $event->getResponse();
        $request = $event->getRequest();
        $cookie = $request->cookies->get(self::COOKIE);
        $response->headers->clearCookie(self::COOKIE);
        $response_routes = array('frontend.cart.offcanvas', 'frontend.checkout.cart.page');


        $dataLayer = $this->dalDealer->getData($event);

        if ($response->isRedirect() && !empty($dataLayer)) {
            $response->headers->setCookie(
                new Cookie(
                    self::COOKIE,
                    $dataLayer,
                    0,
                    '/',
                    null,
                    $request->isSecure(),
                    true,
                    false,
                    Cookie::SAMESITE_LAX
                )
            );

            return;
        }

        if (!$request->isXmlHttpRequest()) {
            return;
        }

        if ($cookie && in_array($event->getRequest()->attributes->get('_route'), $response_routes, true)) {
            $dataLayer = $cookie;
        }

        if ($dataLayer === '[]') {
            return;
        }

        $response->headers->set(
            'Access-Control-Allow-Headers',
            $response->headers->get('Access-Control-Allow-Headers') . ',mapp-intelligence'
        );
        $response->headers->set('mapp-intelligence', $dataLayer);
        $event->setResponse($response);
    }


}
