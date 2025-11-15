import prisma from './config/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    const defaultPassword = await bcrypt.hash('bank123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@fia.go.ug' }
    });

    let admin = existingAdmin;
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin@fia.go.ug',
          password: adminPassword,
          name: 'FIA Administrator',
          role: 'FIA_ADMIN',
          isActive: true
        }
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('✅ Admin user already exists');
    }

    // 17 Organizations matching your frontend
    const organizations = [
      {
        code: 'BOU',
        name: 'Bank of Uganda',
        type: 'REGULATOR',
        contactEmail: 'statistics@bou.or.ug',
        contactPhone: '+256 414 258 441',
        address: 'Plot 37/45 Kampala Road, Kampala',
        userEmail: 'user@bou.go.ug',
        userName: 'Dr. Michael Atingi-Ego'
      },
      {
        code: 'CMA',
        name: 'Capital Markets Authority',
        type: 'REGULATOR',
        contactEmail: 'statistics@cmauganda.co.ug',
        contactPhone: '+256 414 233 520',
        address: 'Jubilee Insurance Centre, Kampala',
        userEmail: 'user@cma.go.ug',
        userName: 'Keith Kalyegira'
      },
      {
        code: 'IRA',
        name: 'Insurance Regulatory Authority',
        type: 'REGULATOR',
        contactEmail: 'statistics@ira.go.ug',
        contactPhone: '+256 414 343 801',
        address: 'Plot 3 Pilkington Road, Kampala',
        userEmail: 'user@ira.go.ug',
        userName: 'Ibrahim Kaddunabbi Lubega'
      },
      {
        code: 'UMRA',
        name: 'Uganda Microfinance Regulatory Authority',
        type: 'REGULATOR',
        contactEmail: 'statistics@umra.go.ug',
        contactPhone: '+256 414 233 520',
        address: 'UMRA Building, Kampala',
        userEmail: 'user@umra.go.ug',
        userName: 'Patrick Mweheire'
      },
      {
        code: 'URSB',
        name: 'Uganda Registration Services Bureau',
        type: 'REGULATOR',
        contactEmail: 'statistics@ursb.go.ug',
        contactPhone: '+256 417 338 000',
        address: 'URSB Building, Kampala',
        userEmail: 'user@ursb.go.ug',
        userName: 'Mercy Kainobwisho'
      },
      {
        code: 'NLGRB',
        name: 'National Lotteries and Gaming Regulatory Board',
        type: 'REGULATOR',
        contactEmail: 'statistics@nlgrb.go.ug',
        contactPhone: '+256 414 343 950',
        address: 'NLGRB House, Kampala',
        userEmail: 'user@nlgrb.go.ug',
        userName: 'James Odongo'
      },
      {
        code: 'MEMD',
        name: 'Ministry of Energy and Mineral Development',
        type: 'MINISTRY',
        contactEmail: 'statistics@memd.go.ug',
        contactPhone: '+256 414 234 000',
        address: 'Amber House, Kampala',
        userEmail: 'user@memd.go.ug',
        userName: 'Robert Kasande'
      },
      {
        code: 'ICPAU',
        name: 'Institute of Certified Public Accountants of Uganda',
        type: 'PROFESSIONAL',
        contactEmail: 'statistics@icpau.co.ug',
        contactPhone: '+256 414 250 839',
        address: 'CPA Centre, Kampala',
        userEmail: 'user@icpau.go.ug',
        userName: 'Dr. Sam Walyemera'
      },
      {
        code: 'ULC',
        name: 'Uganda Law Council',
        type: 'PROFESSIONAL',
        contactEmail: 'statistics@ulc.go.ug',
        contactPhone: '+256 414 348 007',
        address: 'Law Council Building, Kampala',
        userEmail: 'user@ulc.go.ug',
        userName: 'Simon Peter Kinobe'
      },
      {
        code: 'NGO_BUREAU',
        name: 'NGO Bureau',
        type: 'REGULATOR',
        contactEmail: 'statistics@ngobureau.go.ug',
        contactPhone: '+256 414 347 854',
        address: 'NGO Bureau, Kampala',
        userEmail: 'user@ngo_bureau.go.ug',
        userName: 'Stephen Okello'
      },
      {
        code: 'FIA',
        name: 'Financial Intelligence Authority',
        type: 'FIA',
        contactEmail: 'statistics@fia.go.ug',
        contactPhone: '+256 414 342 222',
        address: 'FIA House, Kampala',
        userEmail: 'user@fia.go.ug',
        userName: 'Sydney Asubo'
      },
      {
        code: 'CID',
        name: 'Criminal Investigations Department',
        type: 'LAW_ENFORCEMENT',
        contactEmail: 'statistics@cid.go.ug',
        contactPhone: '+256 414 343 222',
        address: 'CID Headquarters, Kampala',
        userEmail: 'user@cid.go.ug',
        userName: 'Tom Magambo'
      },
      {
        code: 'IG',
        name: 'Inspector General of Government',
        type: 'LAW_ENFORCEMENT',
        contactEmail: 'statistics@igg.go.ug',
        contactPhone: '+256 414 231 724',
        address: 'IGG Building, Kampala',
        userEmail: 'user@ig.go.ug',
        userName: 'Beti Kamya'
      },
      {
        code: 'UWA',
        name: 'Uganda Wildlife Authority',
        type: 'LAW_ENFORCEMENT',
        contactEmail: 'statistics@ugandawildlife.org',
        contactPhone: '+256 414 355 000',
        address: 'UWA Headquarters, Kampala',
        userEmail: 'user@uwa.go.ug',
        userName: 'Sam Mwandha'
      },
      {
        code: 'URA',
        name: 'Uganda Revenue Authority',
        type: 'LAW_ENFORCEMENT',
        contactEmail: 'statistics@ura.go.ug',
        contactPhone: '+256 417 117 000',
        address: 'URA Tower, Kampala',
        userEmail: 'user@ura.go.ug',
        userName: 'John Musinguzi Rujoki'
      },
      {
        code: 'ODPP',
        name: 'Office of the Director of Public Prosecutions',
        type: 'PROSECUTION',
        contactEmail: 'statistics@odpp.go.ug',
        contactPhone: '+256 414 230 538',
        address: 'ODPP Building, Kampala',
        userEmail: 'user@odpp.go.ug',
        userName: 'Jane Frances Abodo'
      },
      {
        code: 'INTERPOL',
        name: 'Interpol Uganda',
        type: 'INTERNATIONAL',
        contactEmail: 'statistics@interpol.go.ug',
        contactPhone: '+256 414 342 555',
        address: 'Police Headquarters, Kampala',
        userEmail: 'user@interpol.go.ug',
        userName: 'Christopher Ddamulira'
      }
    ];

    let createdCount = 0;

    for (const orgData of organizations) {
      const existingOrg = await prisma.organization.findUnique({
        where: { code: orgData.code }
      });

      if (existingOrg) {
        console.log(`⏭️  ${orgData.code} already exists`);
        continue;
      }

      const org = await prisma.organization.create({
        data: {
          code: orgData.code,
          name: orgData.name,
          type: orgData.type as any,
          contactEmail: orgData.contactEmail,
          contactPhone: orgData.contactPhone,
          address: orgData.address,
          isActive: true
        }
      });

      console.log(`✅ Created: ${org.code} - ${org.name}`);

      const orgUser = await prisma.user.create({
        data: {
          email: orgData.userEmail,
          password: defaultPassword,
          name: orgData.userName,
          role: 'ORG_ADMIN',
          organizationId: org.id,
          isActive: true
        }
      });

      console.log(`👤 User: ${orgUser.email}`);
      createdCount++;
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Created ${createdCount} new organizations`);
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@fia.go.ug / admin123');
    console.log('   All Orgs: user@[code].go.ug / bank123');
    console.log('\n📋 Examples:');
    console.log('   BOU: user@bou.go.ug / bank123');
    console.log('   CMA: user@cma.go.ug / bank123');
    console.log('   URA: user@ura.go.ug / bank123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
