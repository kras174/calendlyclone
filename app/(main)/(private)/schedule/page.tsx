import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ScheduleForm } from '@/components/forms/ScheduleForm';
import { auth } from '@clerk/nextjs/server';
import { getSchedule } from '@/server/actions/schedule';

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const schedule = await getSchedule(userId);

  return (
    <Card className="max-w-md mx-auto border-8 border-blue-200 shadow-2xl shadow-accent-foreground">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleForm schedule={schedule} />
      </CardContent>
    </Card>
  );
}
