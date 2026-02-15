import { PrismaClient } from '@prisma/client';
import { hash as _hash } from 'bcryptjs';

const prisma = new PrismaClient();

const traits = [
    { name: 'Adventure lover' },
    { name: 'Socially responsible' },
    { name: 'Book lover' },
    { name: 'Sports enthusiast' },
    { name: 'Creative thinker' },
    { name: 'Music lover' },
    { name: 'Tech enthusiast' },
    { name: 'Nature lover' },
    { name: 'Fitness focused' },
    { name: 'Volunteer minded' },
];

const tasks = [
    // Adventure lover
    { title: 'Trekking Challenge', description: 'Complete a 5km trek together', category: 'outdoor', difficulty: 'medium', traitName: 'Adventure lover' },
    { title: 'Explore a New Place', description: 'Visit a place neither of you have been to before', category: 'exploration', difficulty: 'easy', traitName: 'Adventure lover' },
    { title: 'Outdoor Activity', description: 'Try a new outdoor sport or activity', category: 'outdoor', difficulty: 'medium', traitName: 'Adventure lover' },

    // Socially responsible
    { title: 'Charity Work', description: 'Volunteer together at a local charity', category: 'volunteer', difficulty: 'easy', traitName: 'Socially responsible' },
    { title: 'Community Help', description: 'Help organize a community event', category: 'community', difficulty: 'medium', traitName: 'Socially responsible' },
    { title: 'Environmental Cleanup', description: 'Participate in a beach or park cleanup', category: 'environment', difficulty: 'easy', traitName: 'Socially responsible' },

    // Book lover
    { title: 'Read a Book Together', description: 'Choose and read the same book, then discuss it', category: 'reading', difficulty: 'easy', traitName: 'Book lover' },
    { title: 'Book Club Session', description: 'Attend a book club meeting together', category: 'social', difficulty: 'easy', traitName: 'Book lover' },
    { title: 'Library Visit', description: 'Spend an afternoon exploring a library', category: 'cultural', difficulty: 'easy', traitName: 'Book lover' },

    // Sports enthusiast
    { title: 'Play a Sport', description: 'Play tennis, badminton, or any sport together', category: 'sports', difficulty: 'medium', traitName: 'Sports enthusiast' },
    { title: 'Fitness Challenge', description: 'Complete a 30-day fitness challenge together', category: 'fitness', difficulty: 'hard', traitName: 'Sports enthusiast' },
    { title: 'Team Game', description: 'Join a local sports team or league', category: 'team', difficulty: 'medium', traitName: 'Sports enthusiast' },

    // Creative thinker
    { title: 'Art Challenge', description: 'Create artwork together (painting, sculpture, etc.)', category: 'art', difficulty: 'medium', traitName: 'Creative thinker' },
    { title: 'Writing Challenge', description: 'Write a short story or poem together', category: 'writing', difficulty: 'medium', traitName: 'Creative thinker' },
    { title: 'DIY Project', description: 'Complete a creative DIY project', category: 'craft', difficulty: 'medium', traitName: 'Creative thinker' },

    // Music lover
    { title: 'Concert Visit', description: 'Attend a live concert or music event', category: 'entertainment', difficulty: 'easy', traitName: 'Music lover' },
    { title: 'Learn an Instrument', description: 'Take music lessons together', category: 'learning', difficulty: 'hard', traitName: 'Music lover' },
    { title: 'Create a Playlist', description: 'Collaborate on a shared playlist', category: 'music', difficulty: 'easy', traitName: 'Music lover' },

    // Tech enthusiast
    { title: 'Build a Project', description: 'Code a small app or project together', category: 'technology', difficulty: 'hard', traitName: 'Tech enthusiast' },
    { title: 'Tech Meetup', description: 'Attend a tech conference or meetup', category: 'networking', difficulty: 'easy', traitName: 'Tech enthusiast' },
    { title: 'Learn New Tech', description: 'Learn a new programming language or framework together', category: 'learning', difficulty: 'hard', traitName: 'Tech enthusiast' },

    // Nature lover
    { title: 'Nature Walk', description: 'Take a peaceful walk in nature', category: 'outdoor', difficulty: 'easy', traitName: 'Nature lover' },
    { title: 'Camping Trip', description: 'Go camping for a weekend', category: 'adventure', difficulty: 'medium', traitName: 'Nature lover' },
    { title: 'Wildlife Photography', description: 'Go on a wildlife photography expedition', category: 'photography', difficulty: 'medium', traitName: 'Nature lover' },

    // Fitness focused
    { title: 'Gym Partnership', description: 'Become gym buddies and workout together', category: 'fitness', difficulty: 'medium', traitName: 'Fitness focused' },
    { title: 'Marathon Training', description: 'Train for and run a 5K or marathon', category: 'running', difficulty: 'hard', traitName: 'Fitness focused' },
    { title: 'Yoga Session', description: 'Attend yoga classes together', category: 'wellness', difficulty: 'easy', traitName: 'Fitness focused' },

    // Volunteer minded
    { title: 'Food Bank Volunteer', description: 'Help at a local food bank', category: 'volunteer', difficulty: 'easy', traitName: 'Volunteer minded' },
    { title: 'Teach/Mentor', description: 'Mentor or teach underprivileged children', category: 'education', difficulty: 'medium', traitName: 'Volunteer minded' },
    { title: 'Animal Shelter', description: 'Volunteer at an animal shelter', category: 'animal_care', difficulty: 'easy', traitName: 'Volunteer minded' },
];

async function main() {
    console.log('🌱 Starting database seed...');

    // Create personality traits
    console.log('Creating personality traits...');
    for (const trait of traits) {
        await prisma.personalityTrait.upsert({
            where: { name: trait.name },
            update: {},
            create: trait,
        });
    }
    console.log('✅ Personality traits created');

    // Create tasks
    console.log('Creating tasks...');
    for (const task of tasks) {
        const trait = await prisma.personalityTrait.findUnique({
            where: { name: task.traitName },
        });

        if (trait) {
            await prisma.task.create({
                data: {
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    difficulty: task.difficulty,
                    traitId: trait.id,
                },
            });
        }
    }
    console.log('✅ Tasks created');

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
