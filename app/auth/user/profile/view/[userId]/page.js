import UserProfileContent from '@/app/components/UserProfile';

export default async function UserProfile({ params }) {
    const { userId } = await params;
    return <UserProfileContent userId={userId} />;
}