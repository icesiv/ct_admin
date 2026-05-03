'use server';

export async function revalidateFrontend(tag: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const token = process.env.REVALIDATION_TOKEN;

    if (!siteUrl || !token) {
        console.error('Missing API URL or REVALIDATION_TOKEN');
        return { success: false, error: 'Missing configuration' };
    }

    try {
        const response = await fetch(`${siteUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                type: 'tag',
                tag: tag
            })
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (e: any) {
        console.error('Failed to revalidate frontend:', e);
        return { success: false, error: e.message };
    }
}
