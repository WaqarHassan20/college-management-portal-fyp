import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "English",
  "Chemistry",
  "Economics",
  "Urdu",
  "Islamic Studies",
] as const;

// Authentic PU CS Syllabus Courses
const CS_COURSES = [
  // Semester 1
  { courseCode: "GE-161", courseName: "Introduction to ICT", creditHours: 3, semester: 1 },
  { courseCode: "GE-161L", courseName: "Introduction to ICT Lab", creditHours: 1, semester: 1 },
  { courseCode: "CC-111", courseName: "Discrete Structures", creditHours: 3, semester: 1 },
  { courseCode: "MS-152", courseName: "Probability & Statistics", creditHours: 3, semester: 1 },
  { courseCode: "GE-162", courseName: "English Composition & Comprehension", creditHours: 3, semester: 1 },
  { courseCode: "MS-151", courseName: "Applied Physics", creditHours: 3, semester: 1 },
  { courseCode: "MD-001", courseName: "Math Deficiency - I", creditHours: 3, semester: 1 },

  // Semester 2
  { courseCode: "DC-121", courseName: "Digital Logic Design", creditHours: 3, semester: 2 },
  { courseCode: "DC-121L", courseName: "Digital Logic Design Lab", creditHours: 1, semester: 2 },
  { courseCode: "GE-163", courseName: "Islamic Studies", creditHours: 2, semester: 2 },
  { courseCode: "GE-164", courseName: "Communication & Presentation Skills", creditHours: 3, semester: 2 },
  { courseCode: "MS-153", courseName: "Linear Algebra", creditHours: 3, semester: 2 },
  { courseCode: "GE-165", courseName: "Pakistan Studies", creditHours: 2, semester: 2 },
  { courseCode: "CC-112", courseName: "Programming Fundamentals", creditHours: 3, semester: 2 },
  { courseCode: "CC-112L", courseName: "Programming Fundamentals Lab", creditHours: 1, semester: 2 },
  { courseCode: "MD-002", courseName: "Math Deficiency - II", creditHours: 3, semester: 2 },

  // Semester 3
  { courseCode: "DC-221", courseName: "Comp. Organization & Assembly Language", creditHours: 3, semester: 3 },
  { courseCode: "DC-221L", courseName: "Comp. Organization & Assembly Language Lab", creditHours: 1, semester: 3 },
  { courseCode: "UE-171", courseName: "Introduction to Economics", creditHours: 3, semester: 3 },
  { courseCode: "CC-211", courseName: "Object Oriented Programming", creditHours: 3, semester: 3 },
  { courseCode: "CC-211L", courseName: "Object Oriented Programming Lab", creditHours: 1, semester: 3 },
  { courseCode: "MS-251", courseName: "Calculus & Analytical Geometry", creditHours: 3, semester: 3 },
  { courseCode: "GE-261", courseName: "Professional Practices", creditHours: 3, semester: 3 },

  // Semester 4
  { courseCode: "UE-272", courseName: "Introduction to Psychology", creditHours: 3, semester: 4 },
  { courseCode: "SC-241", courseName: "Multivariate Calculus", creditHours: 3, semester: 4 },
  { courseCode: "DC-222", courseName: "Theory of Automata", creditHours: 3, semester: 4 },
  { courseCode: "CC-212", courseName: "Software Engineering", creditHours: 3, semester: 4 },
  { courseCode: "CC-213", courseName: "Data Structures & Algorithms", creditHours: 3, semester: 4 },
  { courseCode: "CC-213L", courseName: "Data Structures & Algorithms Lab", creditHours: 1, semester: 4 },

  // Semester 5
  { courseCode: "CC-311", courseName: "Operating Systems", creditHours: 3, semester: 5 },
  { courseCode: "CC-311L", courseName: "Operating Systems Lab", creditHours: 1, semester: 5 },
  { courseCode: "DC-321", courseName: "Design & Analysis of Algorithms", creditHours: 3, semester: 5 },
  { courseCode: "DC-322", courseName: "Compiler Construction", creditHours: 3, semester: 5 },
  { courseCode: "CC-215", courseName: "Database Systems", creditHours: 3, semester: 5 },
  { courseCode: "CC-215L", courseName: "Database Systems Lab", creditHours: 1, semester: 5 },
  { courseCode: "EC-331", courseName: "Web Technologies", creditHours: 3, semester: 5 },
  { courseCode: "EC-331L", courseName: "Web Technologies Lab", creditHours: 1, semester: 5 },

  // Semester 6
  { courseCode: "CC-313", courseName: "Computer Networks", creditHours: 3, semester: 6 },
  { courseCode: "CC-313L", courseName: "Computer Networks Lab", creditHours: 1, semester: 6 },
  { courseCode: "DC-323", courseName: "Parallel & Distributed Computing", creditHours: 3, semester: 6 },
  { courseCode: "EC-332", courseName: "Enterprise Application Development", creditHours: 3, semester: 6 },
  { courseCode: "EC-333", courseName: "Mobile application Development", creditHours: 3, semester: 6 },
  { courseCode: "DC-324", courseName: "Artificial Intelligence", creditHours: 3, semester: 6 },
  { courseCode: "DC-324L", courseName: "Artificial Intelligence Lab", creditHours: 1, semester: 6 },

  // Semester 7
  { courseCode: "SC-342", courseName: "Numerical Computing", creditHours: 3, semester: 7 },
  { courseCode: "EC-431", courseName: "Software Project Management", creditHours: 3, semester: 7 },
  { courseCode: "EC-432", courseName: "Software Quality Assurance", creditHours: 3, semester: 7 },
  { courseCode: "CC-411", courseName: "Final Year Project - I", creditHours: 3, semester: 7 },
  { courseCode: "GE-461", courseName: "Technical & Business Writing", creditHours: 3, semester: 7 },

  // Semester 8
  { courseCode: "CC-412", courseName: "Final Year Project - II", creditHours: 3, semester: 8 },
  { courseCode: "UE-472", courseName: "Principles of Management", creditHours: 3, semester: 8 },
  { courseCode: "UE-471", courseName: "Arabic Language", creditHours: 3, semester: 8 },
  { courseCode: "CC-413", courseName: "Information Security", creditHours: 3, semester: 8 },
  { courseCode: "SC-341", courseName: "Theory of Programming Languages", creditHours: 3, semester: 8 },
  { courseCode: "UE-473", courseName: "Social Service", creditHours: 3, semester: 8 },
];

const DEPT_PREFIXES: Record<string, string> = {
  Mathematics: "MTH",
  Physics: "PHY",
  English: "ENG",
  Chemistry: "CHM",
  Economics: "ECO",
  Urdu: "URD",
  "Islamic Studies": "ISL",
};

// Course templates for generating other departments
const DEPT_TEMPLATES: Record<string, Array<{ name: string; credits: number }>> = {
  Mathematics: [
    { name: "Calculus", credits: 3 },
    { name: "Algebra", credits: 3 },
    { name: "Real Analysis", credits: 3 },
    { name: "Topology", credits: 3 },
    { name: "Differential Equations", credits: 3 },
    { name: "Complex Analysis", credits: 3 },
    { name: "Numerical Analysis", credits: 3 },
    { name: "Functional Analysis", credits: 3 },
    { name: "Differential Geometry", credits: 3 },
    { name: "Probability Theory", credits: 3 },
  ],
  Physics: [
    { name: "Mechanics", credits: 3 },
    { name: "Electricity & Magnetism", credits: 3 },
    { name: "Waves & Oscillations", credits: 3 },
    { name: "Quantum Mechanics", credits: 3 },
    { name: "Solid State Physics", credits: 3 },
    { name: "Mathematical Physics", credits: 3 },
    { name: "Electrodynamics", credits: 3 },
    { name: "Nuclear Physics", credits: 3 },
    { name: "Thermodynamics", credits: 3 },
    { name: "Electronics", credits: 3 },
  ],
  English: [
    { name: "English Grammar", credits: 3 },
    { name: "Introduction to Linguistics", credits: 3 },
    { name: "History of English Literature", credits: 3 },
    { name: "Classical Poetry", credits: 3 },
    { name: "Classical Drama", credits: 3 },
    { name: "Novel", credits: 3 },
    { name: "Literary Criticism", credits: 3 },
    { name: "American Literature", credits: 3 },
    { name: "Postcolonial Studies", credits: 3 },
    { name: "Creative Writing", credits: 3 },
  ],
  Chemistry: [
    { name: "Physical Chemistry", credits: 3 },
    { name: "Organic Chemistry", credits: 3 },
    { name: "Inorganic Chemistry", credits: 3 },
    { name: "Analytical Chemistry", credits: 3 },
    { name: "Biochemistry", credits: 3 },
    { name: "Environmental Chemistry", credits: 3 },
    { name: "Polymer Chemistry", credits: 3 },
    { name: "Spectroscopy", credits: 3 },
    { name: "Industrial Chemistry", credits: 3 },
    { name: "Quantum Chemistry", credits: 3 },
  ],
  Economics: [
    { name: "Microeconomics", credits: 3 },
    { name: "Macroeconomics", credits: 3 },
    { name: "Mathematical Economics", credits: 3 },
    { name: "Econometrics", credits: 3 },
    { name: "Development Economics", credits: 3 },
    { name: "Monetary Economics", credits: 3 },
    { name: "Public Finance", credits: 3 },
    { name: "International Trade", credits: 3 },
    { name: "Islamic Economics", credits: 3 },
    { name: "Managerial Economics", credits: 3 },
  ],
  Urdu: [
    { name: "Urdu Zaban o Qawaid", credits: 3 },
    { name: "Tareekh Adab Urdu", credits: 3 },
    { name: "Urdu Dastan o Novel", credits: 3 },
    { name: "Urdu Ghazal", credits: 3 },
    { name: "Urdu Nazm", credits: 3 },
    { name: "Adabi Tanqeed", credits: 3 },
    { name: "Iqbaliyat", credits: 3 },
    { name: "Lisaniyat", credits: 3 },
    { name: "Urdu Nasr", credits: 3 },
    { name: "Jadeed Shairi", credits: 3 },
  ],
  "Islamic Studies": [
    { name: "Uloom-ul-Quran", credits: 3 },
    { name: "Al-Hadith", credits: 3 },
    { name: "Seerah of Prophet (SAW)", credits: 3 },
    { name: "Islamic Jurisprudence (Fiqh)", credits: 3 },
    { name: "Islamic History", credits: 3 },
    { name: "Comparative Religions", credits: 3 },
    { name: "Islamic Philosophy", credits: 3 },
    { name: "Islamic Economics", credits: 3 },
    { name: "Islamic Culture & Civilization", credits: 3 },
    { name: "Research Methodology", credits: 3 },
  ],
};

async function main() {
  console.log("Starting syllabus courses seeding...");

  // 1. Clean existing courses (will cascade delete enrollments, timetables, grades, etc.)
  await prisma.course.deleteMany({});
  console.log("Cleared existing courses.");

  // 2. Insert Computer Science courses
  for (const c of CS_COURSES) {
    await prisma.course.create({
      data: {
        courseCode: c.courseCode,
        courseName: c.courseName,
        creditHours: c.creditHours,
        department: "Computer Science",
        semester: c.semester,
      },
    });
  }
  console.log("Seeded Computer Science courses.");

  // 3. Generate and insert courses for other departments
  for (const dept of DEPARTMENTS) {
    if (dept === "Computer Science") continue;

    const prefix = DEPT_PREFIXES[dept];
    const templates = DEPT_TEMPLATES[dept];

    // For each of the 8 semesters, generate 5 courses
    for (let sem = 1; sem <= 8; sem++) {
      for (let i = 1; i <= 5; i++) {
        // pick a template or generate a name
        const template = templates[(sem * i) % templates.length];
        const courseName = `${template.name} ${"I".repeat(((sem - 1) % 3) + 1)} - Section ${String.fromCharCode(64 + i)}`;
        const courseCode = `${prefix}-${sem}0${i}`;

        await prisma.course.create({
          data: {
            courseCode,
            courseName,
            creditHours: template.credits,
            department: dept,
            semester: sem,
          },
        });
      }
    }
    console.log(`Seeded ${dept} courses.`);
  }

  console.log("Syllabus courses seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
