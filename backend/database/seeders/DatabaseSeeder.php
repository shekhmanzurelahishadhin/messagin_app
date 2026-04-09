<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Thread;
use App\Models\ThreadParticipant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo users
        $alice = User::create([
            'name'     => 'Alice Johnson',
            'email'    => 'alice@example.com',
            'password' => Hash::make('password'),
        ]);

        $bob = User::create([
            'name'     => 'Bob Smith',
            'email'    => 'bob@example.com',
            'password' => Hash::make('password'),
        ]);

        $carol = User::create([
            'name'     => 'Carol Williams',
            'email'    => 'carol@example.com',
            'password' => Hash::make('password'),
        ]);

        $dave = User::create([
            'name'     => 'Dave Martinez',
            'email'    => 'dave@example.com',
            'password' => Hash::make('password'),
        ]);

        $eve = User::create([
            'name'     => 'Eve Chen',
            'email'    => 'eve@example.com',
            'password' => Hash::make('password'),
        ]);

        // ---- Thread 1: Alice <-> Bob ----
        $t1 = Thread::create(['subject' => 'Project Kickoff Meeting', 'created_by' => $alice->id]);
        foreach ([$alice->id, $bob->id] as $uid) {
            ThreadParticipant::create(['thread_id' => $t1->id, 'user_id' => $uid]);
        }
        $this->msg($t1, $alice, 'Hey Bob! Are you available for a project kickoff call this Friday at 2 PM?');
        $this->msg($t1, $bob, 'Hi Alice! Friday works great for me. Should I send out the calendar invite?');
        $this->msg($t1, $alice, 'Yes please! Include Carol and Dave too — they\'re part of the team.');
        $this->msg($t1, $bob, 'Done! Invite sent to everyone. Looking forward to it.');

        // ---- Thread 2: Bob, Carol, Dave (group) ----
        $t2 = Thread::create(['subject' => 'Q3 Design Review', 'created_by' => $bob->id]);
        foreach ([$bob->id, $carol->id, $dave->id] as $uid) {
            ThreadParticipant::create(['thread_id' => $t2->id, 'user_id' => $uid]);
        }
        $this->msg($t2, $bob, 'Team, the design files have been updated in Figma. Please review by EOD Thursday.');
        $this->msg($t2, $carol, 'Checked them out — love the new color palette! I have a few minor comments on the nav.');
        $this->msg($t2, $dave, 'Same here. The mobile layouts look much better than the previous iteration.');
        $this->msg($t2, $carol, 'Should we schedule a sync to go through the comments together?');
        $this->msg($t2, $bob, 'Great idea, Carol. How about Wednesday morning?');

        // ---- Thread 3: Alice, Carol, Eve ----
        $t3 = Thread::create(['subject' => 'Onboarding Documentation', 'created_by' => $carol->id]);
        foreach ([$carol->id, $alice->id, $eve->id] as $uid) {
            ThreadParticipant::create(['thread_id' => $t3->id, 'user_id' => $uid]);
        }
        $this->msg($t3, $carol, 'Hi! I\'ve started drafting the new onboarding docs. Alice, can you review the engineering section?');
        $this->msg($t3, $alice, 'Sure! I\'ll take a look this afternoon and add the environment setup steps.');
        $this->msg($t3, $eve, 'I can handle the design tools section. What\'s the deadline?');
        $this->msg($t3, $carol, 'End of next week works. No rush — just want it done before the new hires start.');

        // ---- Thread 4: Dave <-> Eve ----
        $t4 = Thread::create(['subject' => 'Budget Approval Request', 'created_by' => $dave->id]);
        foreach ([$dave->id, $eve->id] as $uid) {
            ThreadParticipant::create(['thread_id' => $t4->id, 'user_id' => $uid]);
        }
        $this->msg($t4, $dave, 'Eve, I\'ve submitted the budget request for the new tooling licenses. Can you approve when you get a chance?');
        $this->msg($t4, $eve, 'On it! Just reviewed — looks reasonable. Approved and forwarded to finance.');
        $this->msg($t4, $dave, 'Thank you so much! That was fast.');

        // ---- Thread 5: All users ----
        $t5 = Thread::create(['subject' => 'Team Lunch — This Friday!', 'created_by' => $eve->id]);
        foreach ([$eve->id, $alice->id, $bob->id, $carol->id, $dave->id] as $uid) {
            ThreadParticipant::create(['thread_id' => $t5->id, 'user_id' => $uid]);
        }
        $this->msg($t5, $eve, '🎉 Team lunch this Friday at 12:30 PM — Rosetta\'s on 5th. RSVP in this thread!');
        $this->msg($t5, $alice, 'Count me in! Love that place.');
        $this->msg($t5, $bob, 'I\'ll be there 🙌');
        $this->msg($t5, $carol, 'In! Should we order in advance?');
        $this->msg($t5, $dave, 'Yes let\'s order ahead — I\'ll create a shared doc for orders.');
        $this->msg($t5, $eve, 'Perfect. See everyone Friday! 🥗');

        $this->command->info('✅ Seeding complete. Demo users:');
        $this->command->table(
            ['Name', 'Email', 'Password'],
            [
                ['Alice Johnson',   'alice@example.com', 'password'],
                ['Bob Smith',       'bob@example.com',   'password'],
                ['Carol Williams',  'carol@example.com', 'password'],
                ['Dave Martinez',   'dave@example.com',  'password'],
                ['Eve Chen',        'eve@example.com',   'password'],
            ]
        );
    }

    private function msg(Thread $thread, User $user, string $body): void
    {
        Message::create([
            'thread_id' => $thread->id,
            'user_id'   => $user->id,
            'body'      => $body,
            'is_read'   => false,
        ]);

        // Small delay so created_at order is correct
        usleep(10000);
    }
}
