import { NewsScreenEdit } from './component/NewsScreenEdit';

export default async function Page({ params }) {
    const { id } = await params;
    return <NewsScreenEdit post_id={id}/>
}