<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Services;

use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class DalDealer implements DalDealerInterface {
    /**
     * @var EntityRepositoryInterface $productRepository
     */
    private $productRepository;

    /**
     * @var EntityRepositoryInterface $currencyRepository
     */
    private $currencyRepository;

    private $trackData = array();

    public function __construct(
        EntityRepositoryInterface $productRepository,
        EntityRepositoryInterface $currencyRepository
    )
    {
        $this->productRepository = $productRepository;
        $this->currencyRepository = $currencyRepository;
    }

    public function getData($event): ?string {

        $route = $event->getRequest()->attributes->get('_route');
        $request = $event->getRequest();

        switch ($route) {
            case 'frontend.home.page':
                $this->getDefaultData($event);
                $this->trackData['category'] = 'startpage';
                break;
            case 'frontend.detail.page':
                $this->trackData['category'] = 'product';
                $this->trackData['subCategory'] = 'product detail';
                $this->trackData['shoppingCartStatus'] = 'view';
                $productId = $request->attributes->get('productId');
                $this->enrichTrackingDataWithProducts(array($productId));
                break;
            case 'frontend.checkout.line-item.add':
                $this->getDefaultData($event);
                $products = $request->request->get('lineItems');
                $productIds = array();
                foreach ($products as $id => $product) {
                    array_push($productIds, $id);
                    $this->productTrackdataSetter('productQuantity', $product['quantity']);
                }
                $this->enrichTrackingDataWithProducts($productIds);
                $this->trackData['shoppingCartStatus'] = 'basket';
                break;
            default:
                // only for dev
                $this->trackData['debugRoute'] = $route;
                break;
        }

        return json_encode($this->trackData);

//        /**
//         * @var EntityCollection $entities
//         */
//        $entities = $this->productRepository->search(
//            new Criteria([
//                'a0a84a261cee4472a269e4763384b9a5'
//            ]),
//            \Shopware\Core\Framework\Context::createDefaultContext()
//        );
//        $product = $entities->first();
//        $productName = $entities->get('a0a84a261cee4472a269e4763384b9a5')->get('name');
//        $currency = $this->currencyRepository->search(
//            new Criteria([
//                'b7d2554b0ce847cd82f3ac9bd1c0dfca'
//            ]),
//            \Shopware\Core\Framework\Context::createDefaultContext()
//        );
//        $price = $product->getPrice()->first();
//        return 'test';
    }

    private function getDefaultData($event): void {
        $this->trackData['route'] = $event->getRequest()->attributes->get('_route');
    }

    private function enrichTrackingDataWithProducts($ids): void {
       $entities = $this->productRepository->search(
           new Criteria($ids),
           \Shopware\Core\Framework\Context::createDefaultContext()
       )->getElements();
       foreach ($entities as $id => $product) {
           $this->productTrackdataSetter('productId', $id);
           $this->productTrackdataSetter('productName', $product->getName());
           $this->productTrackdataSetter('productPrice', $product->getPrice()->first()->getGross());
       }
    }
    private function productTrackdataSetter(string $key, $value): void {
        $this->trackData[$key] = isset($this->trackData[$key]) ?
            $this->trackData[$key] . ';' . $value : $value;
    }
}
