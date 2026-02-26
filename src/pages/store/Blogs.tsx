import { useQuery } from '@tanstack/react-query';
import { getVendorWithSiteDetailsApi } from '../../Api-Service/Apis';
import { useParams } from 'react-router-dom';
import Blogs from '../Blogs/Blogs';


interface Props { }

function BlogsMain(props: Props) {

    const { id } = useParams<{ id: string }>();

    const getVendorWithSiteDetailsData = useQuery({
        queryKey: ['getVendorWithSiteDetailsData', id],
        queryFn: () => getVendorWithSiteDetailsApi(`${id}/`)
    })
    const vendorSiteDetails = getVendorWithSiteDetailsData?.data?.data;
    const { } = props

    return (
     <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6">
            <Blogs userId={vendorSiteDetails?.vendor?.user} />
        </div>
    )
}

export default BlogsMain;
