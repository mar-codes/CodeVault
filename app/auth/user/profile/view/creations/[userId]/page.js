import UserCreationsContent from '@/app/components/UserCreations';


export default async function UserCreationsPage({ params }) {
  const { userId } = await params;
  return <UserCreationsContent userId={userId} />;
}
