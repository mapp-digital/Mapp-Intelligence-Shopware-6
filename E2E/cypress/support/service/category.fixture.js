const AdminFixtureService =
    require('@shopware-ag/e2e-testsuite-platform/cypress/support/service/administration/fixture.service');

class CategoryFixture extends AdminFixtureService {
    setCategoryFixture(name, id) {
       return this.apiClient.post(`/category/?response=true`, {
            visible: true,
            active: true,
            name,
            id
        });
    }

    setSubCategoryFixture(name, parentName, id) {

        return this.search('category', {value: parentName})
            .then((parent) => {
                if(!parent.id) {
                    setTimeout(()=> {
                        this.setSubCategoryFixture(name, parentName, id)
                    },500);
                    return null;
                }
                expect(parent.id).to.exist;
                return this.apiClient.post(`/category/?response=true`, {
                    visible: true,
                    active: true,
                    parentId: parent.id,
                    name,
                    id
                });
        })
    }

    search(type, filter) {
        return this.apiClient.post(`/search/${type}?response=true`, {
            filter: [{
                field: filter.field ? filter.field : 'name',
                type: 'equals',
                value: filter.value
            }]
        });
    }
}
module.exports = CategoryFixture;
