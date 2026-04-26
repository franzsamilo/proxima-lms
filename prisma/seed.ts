import { PrismaClient, Role, SchoolLevel, Tier, LessonType, ModuleStatus, SubmissionStatus, AnnouncementPriority } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const isProd = process.env.NODE_ENV === "production"

/**
 * Production-safe bootstrap: idempotently create or update an admin user
 * from env vars. No demo data, no destructive deletes. Safe to run repeatedly.
 */
async function bootstrapAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim() || "Site Administrator"

  if (!email || !password) {
    console.error(
      "[seed] ADMIN_EMAIL and ADMIN_PASSWORD env vars are required for production seeding."
    )
    process.exit(1)
  }
  if (password.length < 12) {
    console.error("[seed] ADMIN_PASSWORD must be at least 12 characters in production.")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const result = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: Role.ADMIN },
    update: { name, passwordHash, role: Role.ADMIN },
    select: { id: true, email: true, role: true },
  })
  console.log(`[seed] Bootstrapped admin: ${result.email} (${result.id})`)
}

async function main() {
  if (isProd) {
    if (process.env.SEED_ALLOW_PRODUCTION !== "true") {
      console.error(
        "[seed] Refusing to run in production. Set SEED_ALLOW_PRODUCTION=true to override.\n" +
          "       In production this only bootstraps an admin from ADMIN_EMAIL/ADMIN_PASSWORD —\n" +
          "       it does NOT create demo data or wipe tables."
      )
      process.exit(1)
    }
    await bootstrapAdminFromEnv()
    return
  }

  // Dev mode below — original destructive demo seed.
  await prisma.submission.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.hardwareAssignment.deleteMany()
  await prisma.hardwareKit.deleteMany()
  await prisma.course.deleteMany()
  await prisma.lessonPackage.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 12)
  // Optional dev override of the admin password — useful for testing.
  const adminPassword = process.env.ADMIN_PASSWORD ?? "password123"
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "admin@proxima.edu"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  // ─── Users ───
  const teacher = await prisma.user.create({
    data: { name: "Dr. Elena Vasquez", email: "elena@proxima.edu", passwordHash, role: Role.TEACHER, department: "Robotics Engineering" },
  })
  const student = await prisma.user.create({
    data: { name: "Marcus Chen", email: "marcus@student.proxima.edu", passwordHash, role: Role.STUDENT, schoolLevel: SchoolLevel.COLLEGE },
  })
  const student2 = await prisma.user.create({
    data: { name: "Aisha Patel", email: "aisha@student.proxima.edu", passwordHash, role: Role.STUDENT, schoolLevel: SchoolLevel.HS },
  })
  const student3 = await prisma.user.create({
    data: { name: "Jake Morrison", email: "jake@student.proxima.edu", passwordHash, role: Role.STUDENT, schoolLevel: SchoolLevel.ELEMENTARY },
  })
  const admin = await prisma.user.create({
    data: { name: "System Admin", email: adminEmail, passwordHash: adminPasswordHash, role: Role.ADMIN },
  })

  // ─── Lesson Packages ───
  const pkgStarter = await prisma.lessonPackage.create({
    data: { name: "RoboStarter Kit", level: SchoolLevel.ELEMENTARY, tier: Tier.STARTER, price: 299, description: "Foundational robotics curriculum for elementary learners. Covers basic robot anatomy, sensors, and simple programming with block-based and Python hybrid approaches.", includes: ["Slide decks", "Code skeletons", "Quizzes", "Hardware setup guide"] },
  })
  const pkgExplorer = await prisma.lessonPackage.create({
    data: { name: "Explorer Toolkit", level: SchoolLevel.HS, tier: Tier.EXPLORER, price: 499, description: "Intermediate robotics and Python programming for high school students. Includes computer vision, autonomous navigation, and project-based assessments.", includes: ["Slide decks", "Code skeletons", "Quizzes", "Video tutorials", "Project briefs", "Hardware setup guide"] },
  })
  const pkgPro = await prisma.lessonPackage.create({
    data: { name: "ProBot Suite", level: SchoolLevel.COLLEGE, tier: Tier.PROFESSIONAL, price: 799, description: "Advanced robotics engineering curriculum covering kinematics, PID control, ROS2, and multi-DOF manipulation. Designed for university-level courses.", includes: ["Slide decks", "Code skeletons", "Quizzes", "Video tutorials", "Project briefs", "Research papers", "Lab manuals", "Hardware setup guide"] },
  })

  // ─── Courses ───
  const course1 = await prisma.course.create({
    data: { title: "Introduction to Robotics", description: "Foundational concepts in robotics, sensors, and basic movement programming. Students learn to identify robot components, write simple motor control programs, and build a line-following robot.", level: SchoolLevel.ELEMENTARY, tier: Tier.STARTER, maxStudents: 40, startDate: new Date("2026-01-12"), endDate: new Date("2026-05-22"), isPublished: true, instructorId: teacher.id, packageId: pkgStarter.id },
  })
  const course2 = await prisma.course.create({
    data: { title: "Advanced Kinematics & Control", description: "Inverse kinematics, PID control, and multi-DOF arm manipulation. Students implement forward kinematics solvers, tune PID controllers, and program robotic arms for pick-and-place tasks.", level: SchoolLevel.COLLEGE, tier: Tier.PROFESSIONAL, maxStudents: 25, startDate: new Date("2026-01-12"), endDate: new Date("2026-05-22"), isPublished: true, instructorId: teacher.id, packageId: pkgPro.id },
  })
  const course3 = await prisma.course.create({
    data: { title: "Robot Programming with Python", description: "Python-based robot control, computer vision basics, and autonomous navigation. Students progress from basic syntax to writing autonomous navigation algorithms.", level: SchoolLevel.HS, tier: Tier.EXPLORER, maxStudents: 35, startDate: new Date("2026-02-03"), endDate: new Date("2026-06-12"), isPublished: true, instructorId: teacher.id, packageId: pkgExplorer.id },
  })

  // ─── Enrollments ───
  await prisma.enrollment.createMany({
    data: [
      { studentId: student.id, courseId: course1.id, progress: 28 },
      { studentId: student.id, courseId: course2.id, progress: 42 },
      { studentId: student.id, courseId: course3.id, progress: 65 },
      { studentId: student2.id, courseId: course3.id, progress: 50 },
      { studentId: student3.id, courseId: course1.id, progress: 15 },
    ],
  })

  // ─── Course 1 Modules & Lessons ───
  const mod1 = await prisma.module.create({ data: { title: "Robot Anatomy", order: 1, status: ModuleStatus.PUBLISHED, courseId: course1.id } })

  const l1 = await prisma.lesson.create({ data: { title: "Parts of a Robot", type: LessonType.SLIDES, order: 1, durationMins: 30, moduleId: mod1.id,
    content: { slides: [
      { title: "What is a Robot?", body: "A robot is a programmable machine capable of carrying out actions autonomously or semi-autonomously. Robots combine **sensors** (to perceive), **actuators** (to act), and a **controller** (to decide)." },
      { title: "The Controller", body: "The controller is the brain of the robot. It is typically a microcontroller (like Arduino) or a single-board computer (like Raspberry Pi). It reads sensor data, runs your program, and sends signals to actuators." },
      { title: "Sensors", body: "Sensors let the robot perceive its environment:\n- **Ultrasonic sensor**: measures distance using sound waves\n- **Infrared sensor**: detects proximity and line edges\n- **Light sensor**: measures ambient light levels\n- **Touch/bumper sensor**: detects physical contact" },
      { title: "Actuators", body: "Actuators are the muscles of the robot:\n- **DC motors**: provide continuous rotation for wheels\n- **Servo motors**: rotate to precise angles for arms/grippers\n- **Stepper motors**: precise rotational control\n- **LEDs and buzzers**: visual and audio output" },
      { title: "Chassis & Frame", body: "The chassis holds everything together. Common materials include acrylic, aluminum, and 3D-printed plastic. The design depends on the robot's purpose — wheeled platforms for mobility, arm bases for manipulation." },
      { title: "Power Supply", body: "Robots need power! Common options:\n- **AA batteries**: simple, replaceable\n- **LiPo batteries**: rechargeable, high energy density\n- **USB power**: for stationary/tethered robots\n\nAlways check voltage requirements before connecting!" },
      { title: "Putting It All Together", body: "A complete robot system:\n1. Power supply provides energy\n2. Controller runs your program\n3. Sensors feed data to the controller\n4. Controller decides actions\n5. Actuators execute movements\n\nIn the next lesson, we'll explore each sensor type in detail." }
    ] },
  } })

  const l2 = await prisma.lesson.create({ data: { title: "Sensors Overview", type: LessonType.SLIDES, order: 2, durationMins: 25, moduleId: mod1.id,
    content: { slides: [
      { title: "Why Sensors Matter", body: "Without sensors, a robot is blind. Sensors transform physical phenomena (light, sound, distance, touch) into electrical signals the controller can read." },
      { title: "Ultrasonic Sensors", body: "Emit sound pulses and measure the echo return time to calculate distance. Range: 2cm-400cm. Common model: HC-SR04.\n\n**Use cases**: obstacle avoidance, distance measurement, parking assist" },
      { title: "Infrared Sensors", body: "Two types:\n- **Proximity IR**: detects objects within ~30cm using reflected IR light\n- **Line-following IR**: detects dark vs light surfaces (used for line-following robots)\n\nFast response time but affected by ambient light." },
      { title: "Other Sensors", body: "- **Gyroscope/Accelerometer (IMU)**: measures orientation and motion\n- **Color sensor**: identifies colors\n- **Temperature sensor**: monitors heat\n- **Encoder**: counts wheel rotations for precise distance tracking" },
      { title: "Choosing the Right Sensor", body: "Match the sensor to the task:\n- Need to avoid walls? → Ultrasonic\n- Following a line? → IR reflectance\n- Measuring rotation? → Encoder\n- Balancing? → IMU\n\nNext: test your knowledge with a quiz!" }
    ] },
  } })

  const l3 = await prisma.lesson.create({ data: { title: "Identify Components Quiz", type: LessonType.QUIZ, order: 3, durationMins: 15, moduleId: mod1.id,
    content: { questions: [
      { id: "q1", question: "What is the 'brain' of a robot called?", options: ["Actuator", "Controller", "Sensor", "Chassis"], correctIndex: 1 },
      { id: "q2", question: "Which sensor uses sound waves to measure distance?", options: ["Ultrasonic", "Infrared", "Gyroscope", "Encoder"], correctIndex: 0 },
      { id: "q3", question: "What type of motor is best for precise angular positioning?", options: ["DC motor", "Stepper motor", "Servo motor", "Linear actuator"], correctIndex: 2 },
      { id: "q4", question: "Which component converts electrical energy into physical motion?", options: ["Sensor", "Controller", "Power supply", "Actuator"], correctIndex: 3 },
      { id: "q5", question: "What does an IR reflectance sensor detect?", options: ["Sound waves", "Light vs dark surfaces", "Temperature", "Magnetic fields"], correctIndex: 1 },
    ] },
  } })

  const mod2 = await prisma.module.create({ data: { title: "Basic Movement", order: 2, status: ModuleStatus.PUBLISHED, courseId: course1.id } })

  const l4 = await prisma.lesson.create({ data: { title: "Motor Control Basics", type: LessonType.SLIDES, order: 1, durationMins: 35, moduleId: mod2.id,
    content: { slides: [
      { title: "How DC Motors Work", body: "DC motors convert electrical energy into rotational motion. By varying voltage, we control speed. By reversing polarity, we reverse direction." },
      { title: "Motor Drivers", body: "Microcontrollers can't power motors directly — they need motor drivers (like L298N or L293D). The driver acts as a bridge between the low-power controller and the high-power motor." },
      { title: "PWM Speed Control", body: "Pulse Width Modulation (PWM) controls motor speed by rapidly switching power on/off. A 50% duty cycle = half speed. Most controllers output PWM on specific pins." },
      { title: "Differential Drive", body: "Two-wheeled robots use differential drive:\n- Both motors forward = drive straight\n- Left motor slower = turn left\n- Motors opposite directions = spin in place\n\nThis is the most common drive system for educational robots." },
      { title: "Your First Program", body: "In the next lesson, you'll write code to:\n1. Drive forward for 2 seconds\n2. Turn left 90 degrees\n3. Drive forward for 1 second\n4. Stop\n\nGet your robot kit ready!" }
    ] },
  } })

  const l5 = await prisma.lesson.create({ data: { title: "Your First Drive Program", type: LessonType.CODE, order: 2, durationMins: 45, moduleId: mod2.id,
    codeSkeleton: "import robot\n\nSPEED = 50\n\ndef drive_forward(speed=SPEED):\n    \"\"\"Drive both motors forward at given speed.\"\"\"\n    # TODO: Set left and right motors to 'speed'\n    pass\n\ndef turn_left(degrees):\n    \"\"\"Turn the robot left by the given degrees.\"\"\"\n    # TODO: Spin motors in opposite directions\n    pass\n\ndef stop():\n    \"\"\"Stop all motors.\"\"\"\n    # TODO: Set both motors to 0\n    pass\n\n# Main Sequence\n# 1. Drive forward for 2 seconds\n# 2. Turn left 90 degrees\n# 3. Drive forward for 1 second\n# 4. Stop the robot\n",
    content: { brief: "Write a program to drive your robot in an L-shaped path. Complete the function stubs to control the motors, then execute the main sequence.", hints: ["Use robot.left_motor(speed) and robot.right_motor(speed)", "Use robot.wait(seconds) to pause", "For turning, try opposite speeds (-30 and 30)"] },
  } })

  const l6 = await prisma.lesson.create({ data: { title: "Line Following Challenge", type: LessonType.TASK, order: 3, durationMins: 60, moduleId: mod2.id,
    content: { brief: "Program your robot to follow a black line on a white surface using IR reflectance sensors. Your robot must complete a full loop without leaving the line.",
      requirements: ["Robot must follow the line autonomously", "Must handle at least one 90-degree turn", "Must complete the course within 2 minutes", "Submit your code AND a video recording"],
      rubric: { "Code quality (30pts)": "Clean code, proper functions, comments", "Line following accuracy (30pts)": "Stays on line, handles curves", "Turn handling (20pts)": "Successfully navigates turns", "Video demo (20pts)": "Clear video showing full course completion" } },
  } })

  const mod3 = await prisma.module.create({ data: { title: "Sensor Integration", order: 3, status: ModuleStatus.DRAFT, courseId: course1.id } })

  const l7 = await prisma.lesson.create({ data: { title: "Reading Sensor Data", type: LessonType.SLIDES, order: 1, durationMins: 30, moduleId: mod3.id,
    content: { slides: [
      { title: "Analog vs Digital", body: "Digital sensors return 0 or 1. Analog sensors return a range (0-1023 on Arduino)." },
      { title: "Reading in Code", body: "Use robot.read_sensor(port), robot.read_distance(), and robot.read_line()." },
      { title: "Filtering Noise", body: "Techniques: averaging, thresholding, debouncing." }
    ] },
  } })

  const l8 = await prisma.lesson.create({ data: { title: "Obstacle Avoidance Code", type: LessonType.CODE, order: 2, durationMins: 50, moduleId: mod3.id,
    codeSkeleton: "import robot\n\nSAFE_DISTANCE = 20\nSPEED = 40\n\ndef avoid_obstacle():\n    distance = robot.read_distance()\n    if distance < SAFE_DISTANCE:\n        # TODO: Stop, turn, proceed\n        pass\n    else:\n        # TODO: Drive forward\n        pass\n\nwhile True:\n    avoid_obstacle()\n    robot.wait(0.1)\n",
    content: { brief: "Implement obstacle avoidance using the ultrasonic sensor.", hints: ["Read distance before each move", "Stop, turn right ~90 degrees, check again"] },
  } })

  const l9 = await prisma.lesson.create({ data: { title: "Navigate the Maze", type: LessonType.TASK, order: 3, durationMins: 90, moduleId: mod3.id,
    content: { brief: "Program your robot to navigate a simple maze autonomously.",
      requirements: ["Use ultrasonic sensor for wall detection", "Navigate at least 3 turns", "No pre-programmed paths", "Submit code and video"],
      rubric: { "Algorithm design (35pts)": "Smart decisions, handles dead ends", "Sensor usage (25pts)": "Effective sensor use", "Code quality (20pts)": "Clean and documented", "Video demo (20pts)": "Shows maze navigation" } },
  } })

  // ─── Course 2 Modules & Lessons ───
  const mod4 = await prisma.module.create({ data: { title: "Forward Kinematics", order: 1, status: ModuleStatus.PUBLISHED, courseId: course2.id } })

  const l10 = await prisma.lesson.create({ data: { title: "DH Parameters", type: LessonType.SLIDES, order: 1, durationMins: 45, moduleId: mod4.id,
    content: { slides: [
      { title: "DH Convention", body: "The Denavit-Hartenberg convention assigns coordinate frames to each link using four parameters: theta (joint angle), d (link offset), a (link length), alpha (link twist)." },
      { title: "DH Parameter Table", body: "For a 3-DOF planar arm:\n\n| Joint | theta | d | a | alpha |\n|---|---|---|---|---|\n| 1 | theta1 | 0 | L1 | 0 |\n| 2 | theta2 | 0 | L2 | 0 |\n| 3 | theta3 | 0 | L3 | 0 |" },
      { title: "Transformation Matrix", body: "Each joint's DH params define a 4x4 homogeneous transformation. Chain all: T = T1 * T2 * ... * Tn" },
      { title: "Next: Implementation", body: "In the lab, you'll build a FK solver in Python using NumPy." }
    ] },
  } })

  const l11 = await prisma.lesson.create({ data: { title: "FK Solver Lab", type: LessonType.CODE, order: 2, durationMins: 60, moduleId: mod4.id,
    codeSkeleton: "import numpy as np\n\ndef dh_transform(theta, d, a, alpha):\n    \"\"\"Compute 4x4 DH transformation matrix.\"\"\"\n    # TODO: Implement\n    pass\n\ndef forward_kinematics(dh_params):\n    \"\"\"Chain DH transforms for end-effector pose.\"\"\"\n    # TODO: Implement\n    pass\n\n# Test: 2-DOF planar arm\nL1, L2 = 1.0, 0.8\ntheta1 = np.radians(45)\ntheta2 = np.radians(30)\nT = forward_kinematics([(theta1, 0, L1, 0), (theta2, 0, L2, 0)])\nprint(f\"End-effector: x={T[0,3]:.3f}, y={T[1,3]:.3f}\")\nprint(f\"Expected: x=0.400, y=1.169\")\n",
    content: { brief: "Implement a forward kinematics solver using DH parameters and NumPy.", hints: ["Use the 4x4 DH matrix formula", "Chain with matrix multiplication: T = T @ T_new", "Test with known joint angles"] },
  } })

  const mod5 = await prisma.module.create({ data: { title: "PID Control", order: 2, status: ModuleStatus.PUBLISHED, courseId: course2.id } })

  const l12 = await prisma.lesson.create({ data: { title: "PID Theory", type: LessonType.SLIDES, order: 1, durationMins: 40, moduleId: mod5.id,
    content: { slides: [
      { title: "What is PID?", body: "PID is a control loop mechanism: Proportional, Integral, Derivative. The most widely used controller in robotics." },
      { title: "The Three Terms", body: "P: proportional to current error. I: accumulated past error. D: rate of error change." },
      { title: "The Equation", body: "output = Kp*e(t) + Ki*integral(e) + Kd*de/dt" },
      { title: "Tuning", body: "Start with Ki=0, Kd=0. Increase Kp until oscillation. Add Kd to dampen. Add Ki for steady-state error." }
    ] },
  } })

  const l13 = await prisma.lesson.create({ data: { title: "PID Tuning Challenge", type: LessonType.TASK, order: 2, durationMins: 90, moduleId: mod5.id,
    content: { brief: "Implement and tune a PID controller for robot arm position control. Settle within +-2 degrees of target.",
      requirements: ["PID class with configurable Kp, Ki, Kd", "Integral windup protection", "Demonstrate 3 target positions", "Plot error over time", "Submit code, tuning values, and video"],
      rubric: { "PID implementation (30pts)": "Correct formula, windup protection", "Tuning quality (30pts)": "Fast settling, minimal overshoot", "Documentation (20pts)": "Clear tuning explanation", "Video demo (20pts)": "Smooth arm movement" } },
  } })

  // ─── Course 3 Modules & Lessons ───
  const mod6 = await prisma.module.create({ data: { title: "Python Foundations", order: 1, status: ModuleStatus.PUBLISHED, courseId: course3.id } })

  const l14 = await prisma.lesson.create({ data: { title: "Variables & Loops for Robots", type: LessonType.SLIDES, order: 1, durationMins: 35, moduleId: mod6.id,
    content: { slides: [
      { title: "Why Python?", body: "Python is readable, has powerful libraries (NumPy, OpenCV), and lets you focus on algorithms." },
      { title: "Variables", body: "Variables store sensor readings, speeds, and state:\nspeed = 50\ndistance = robot.read_distance()\nis_moving = True" },
      { title: "While Loops", body: "Robots run in continuous loops:\nwhile True:\n    distance = robot.read_distance()\n    if distance < 20:\n        robot.stop()\n    else:\n        robot.drive(50)" },
      { title: "For Loops", body: "For repeating actions:\nfor i in range(5):\n    robot.led('green')\n    time.sleep(0.5)\n    robot.led('off')\n    time.sleep(0.5)" }
    ] },
  } })

  const l15 = await prisma.lesson.create({ data: { title: "Hello Robot Program", type: LessonType.CODE, order: 2, durationMins: 40, moduleId: mod6.id,
    codeSkeleton: "import robot\nimport time\n\ndef greet():\n    \"\"\"Greet with lights and sound.\"\"\"\n    # TODO: Print greeting, LED green, beep, wait, LED off\n    pass\n\ndef dance():\n    \"\"\"Simple dance routine.\"\"\"\n    # TODO: Spin right 0.5s, left 0.5s, forward 0.3s, back 0.3s. Repeat 3x.\n    pass\n\ndef sensor_check():\n    \"\"\"Read and display sensors.\"\"\"\n    # TODO: Read distance and line sensors, print values\n    pass\n\nprint(\"=== Hello Robot ===\")\ngreet()\ndance()\nsensor_check()\nprint(\"=== Done ===\")\n",
    content: { brief: "Write your first complete robot program with LED, motor, sound, and sensor functions.", hints: ["robot.led('green')/robot.led('off')", "robot.beep(440, 500)", "robot.left_motor(speed)/robot.right_motor(speed)", "robot.read_distance() returns cm", "time.sleep(seconds) for delays"] },
  } })

  // ─── Submissions ───
  await prisma.submission.create({ data: { status: SubmissionStatus.SUBMITTED, submittedAt: new Date("2026-03-28T14:30:00Z"), videoUrl: "https://uploads.proxima.edu/demos/line_follow_marcus.mp4", studentId: student.id, lessonId: l6.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.GRADED, submittedAt: new Date("2026-03-25T09:15:00Z"), gradedAt: new Date("2026-03-26T10:00:00Z"), grade: 92, feedback: "Excellent motor control logic. Consider adding error handling for sensor disconnects. The turn function works well but could be more precise with encoder feedback.", codeContent: "import robot\n\ndef drive_forward(speed=50):\n    robot.left_motor(speed)\n    robot.right_motor(speed)\n\ndef turn_left(angle):\n    robot.left_motor(-30)\n    robot.right_motor(30)\n    robot.wait(angle / 90)\n    robot.stop()\n\ndef stop():\n    robot.left_motor(0)\n    robot.right_motor(0)\n\ndrive_forward()\nrobot.wait(2)\nturn_left(90)\ndrive_forward()\nrobot.wait(1)\nstop()", studentId: student.id, lessonId: l5.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.SUBMITTED, submittedAt: new Date("2026-03-30T16:45:00Z"), codeContent: "import numpy as np\n\ndef dh_transform(theta, d, a, alpha):\n    ct, st = np.cos(theta), np.sin(theta)\n    ca, sa = np.cos(alpha), np.sin(alpha)\n    return np.array([[ct, -st*ca, st*sa, a*ct],[st, ct*ca, -ct*sa, a*st],[0, sa, ca, d],[0, 0, 0, 1]])\n\ndef forward_kinematics(dh_params):\n    T = np.eye(4)\n    for p in dh_params:\n        T = T @ dh_transform(*p)\n    return T\n\nL1, L2 = 1.0, 0.8\nT = forward_kinematics([(np.radians(45), 0, L1, 0), (np.radians(30), 0, L2, 0)])\nprint(f\"x={T[0,3]:.3f}, y={T[1,3]:.3f}\")", studentId: student.id, lessonId: l11.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.GRADED, submittedAt: new Date("2026-03-20T11:00:00Z"), gradedAt: new Date("2026-03-21T09:30:00Z"), grade: 88, feedback: "Good work! Review actuator types — you confused stepper and servo motors on Q3.", quizAnswers: { q1: "B", q2: "A", q3: "C", q4: "D", q5: "B" }, studentId: student.id, lessonId: l3.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.GRADED, submittedAt: new Date("2026-03-22T13:20:00Z"), gradedAt: new Date("2026-03-23T08:00:00Z"), grade: 95, feedback: "Clean code structure with excellent use of functions. The dance routine is creative!", codeContent: "import robot\nimport time\n\ndef greet():\n    print('Hello, Robot!')\n    robot.led('green')\n    robot.beep(440, 500)\n    time.sleep(1)\n    robot.led('off')\n\ndef dance():\n    for i in range(3):\n        robot.left_motor(40)\n        robot.right_motor(-40)\n        time.sleep(0.5)\n        robot.left_motor(-40)\n        robot.right_motor(40)\n        time.sleep(0.5)\n        robot.left_motor(30)\n        robot.right_motor(30)\n        time.sleep(0.3)\n        robot.left_motor(-30)\n        robot.right_motor(-30)\n        time.sleep(0.3)\n    robot.left_motor(0)\n    robot.right_motor(0)\n\ndef sensor_check():\n    dist = robot.read_distance()\n    line = robot.read_line()\n    print(f'Distance: {dist}cm')\n    print(f'Line: {\"black\" if line == 0 else \"white\"}')\n    if dist < 30:\n        print('Warning: obstacle nearby!')\n\nprint('=== Hello Robot ===')\ngreet()\ndance()\nsensor_check()\nprint('=== Done ===')", studentId: student.id, lessonId: l15.id } })

  // ─── Hardware Kits ───
  const kit1 = await prisma.hardwareKit.create({ data: { name: "Proxima Scout", level: SchoolLevel.ELEMENTARY, specs: "2-wheel differential drive, 3 sensors (ultrasonic, 2x IR line), LED array, buzzer, Arduino Nano controller, AA battery pack", totalQty: 45, imageEmoji: "🤖" } })
  const kit2 = await prisma.hardwareKit.create({ data: { name: "Proxima Ranger", level: SchoolLevel.HS, specs: "4-wheel mecanum drive, camera module, 6 sensors (ultrasonic, IR, IMU, color, 2x encoder), gripper, Raspberry Pi 4, LiPo battery", totalQty: 30, imageEmoji: "🦾" } })
  const kit3 = await prisma.hardwareKit.create({ data: { name: "Proxima Apex", level: SchoolLevel.COLLEGE, specs: "6-DOF robotic arm, LIDAR, stereo vision, force/torque sensor, ROS2-compatible, Jetson Nano, 24V power supply", totalQty: 20, imageEmoji: "🦿" } })

  await prisma.hardwareAssignment.createMany({ data: [
    { kitId: kit1.id, userId: student3.id },
    { kitId: kit2.id, userId: student2.id },
    { kitId: kit3.id, userId: student.id },
  ] })

  // ─── Announcements ───
  await prisma.announcement.createMany({ data: [
    { title: "Robotics Fair Registration Open", content: "Sign up for the annual robotics fair by April 15th. Showcase your semester projects! Teams of up to 3. Prizes for Best in Show, Most Innovative, and People's Choice.", priority: AnnouncementPriority.HIGH, authorId: teacher.id },
    { title: "Lab Hours Extended", content: "The robotics lab (Room 204) will be open until 9 PM on weekdays starting next week. Weekend hours: 10 AM - 5 PM. Sign the log sheet when entering.", priority: AnnouncementPriority.NORMAL, authorId: admin.id },
    { title: "New Sensor Kits Available", content: "We've received 15 new ultrasonic sensor kits and 10 infrared sensor arrays. See the lab technician (Ms. Rodriguez, Room 206) to check one out.", priority: AnnouncementPriority.NORMAL, authorId: teacher.id },
  ] })

  // ─── Calendar Events ───
  await prisma.calendarEvent.createMany({ data: [
    { title: "Line Following Challenge Due", date: new Date("2026-04-05"), type: "deadline", courseId: course1.id },
    { title: "FK Solver Lab Due", date: new Date("2026-04-08"), type: "deadline", courseId: course2.id },
    { title: "Midterm Exam — Intro to Robotics", date: new Date("2026-04-14"), type: "exam", courseId: course1.id },
    { title: "Annual Robotics Fair", date: new Date("2026-04-20"), type: "event" },
    { title: "PID Tuning Challenge Due", date: new Date("2026-04-22"), type: "deadline", courseId: course2.id },
    { title: "Final Projects Due — All Courses", date: new Date("2026-05-15"), type: "deadline" },
  ] })

  console.log("✅ Seed complete (dev mode)")
  console.log("Demo accounts (password: password123 unless overridden):")
  console.log("  Teacher:  elena@proxima.edu")
  console.log("  Student:  marcus@student.proxima.edu")
  console.log("  Student:  aisha@student.proxima.edu")
  console.log("  Student:  jake@student.proxima.edu")
  console.log(`  Admin:    ${adminEmail}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
