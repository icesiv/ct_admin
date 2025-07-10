import { NewsScreenEdit } from './component/NewsScreenEdit';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <NewsScreenEdit post_id={Number(id)} />;
}