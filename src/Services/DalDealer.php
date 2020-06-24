<?php declare(strict_types=1);

namespace Mapp\MappIntelligence\Services;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class DalDealer implements DalDealerInterface {
    /**
     * @var EntityRepositoryInterface $productRepository
     */
    private $productRepository;

    /**
     * @var EntityRepositoryInterface $categoryRepository
     */
    private $categoryRepository;

    private $trackData = array();

    public function __construct(
        EntityRepositoryInterface $productRepository,
        EntityRepositoryInterface $categoryRepository
    )
    {
        $this->productRepository = $productRepository;
        $this->categoryRepository = $categoryRepository;
    }

    public function getCategoryNames($categoryIds): ?array {
        if($categoryIds === null) {
            return array();
        }
        $output = array();
        $categoryNames = $this->categoryRepository->search(
            new Criteria($categoryIds),
            \Shopware\Core\Framework\Context::createDefaultContext()
        );
        foreach ($categoryNames->getElements() as $category) {
            array_push($output, $category->getName());
        }
        return $output;
    }

    public function getSoldOutStatus($productId): string
    {
        if($productId === null) {
            return '';
        }
        $stock = $this->productRepository->search(
            new Criteria([$productId]),
            \Shopware\Core\Framework\Context::createDefaultContext()
        )->first()->getAvailableStock();

        return $stock <= 0 ? "1": "";
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
