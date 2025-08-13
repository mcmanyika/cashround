import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LayoutWithHeader } from '../src/components/layout/Layout';

export default function Whitepaper() {
  return (
    <>
      <Head>
        <title>Cash Round - Technical White Paper</title>
        <meta name="description" content="Technical white paper for Cash Round - Decentralized MUKANDO platform" />
      </Head>
      
      <LayoutWithHeader showSignout={false}>
        <div className="container px-4 py-8 max-w-4xl" style={{ marginLeft: '0', textAlign: 'left' }}>
          {/* Header */}
          <div className="mb-12" style={{ textAlign: 'left' }}>
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ textAlign: 'left' }}>
              Technical White Paper
            </h1>
            <p className="text-xl text-gray-600 mb-2" style={{ textAlign: 'left' }}>
              Cash Round: Decentralized MUKANDO Platform
            </p>
            <p className="text-gray-500" style={{ textAlign: 'left' }}>
              Version 1.0 | August 2025
            </p>
            <p className="text-gray-500" style={{ textAlign: 'left' }}>
              Developed by Partson Manyika
            </p>
          </div>

          {/* Executive Summary */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-8" style={{ textAlign: 'left' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ textAlign: 'left' }}>Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cash Round is a decentralized platform that digitizes traditional MUKANDO (Rotating Savings and Credit Association) 
              systems using blockchain technology. The platform combines the proven economic model of rotating savings with 
              modern DeFi infrastructure, creating a secure, transparent, and accessible financial tool for communities worldwide.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By leveraging smart contracts on the Polygon network, Cash Round eliminates the need for trusted intermediaries 
              while maintaining the social and economic benefits of traditional MUKANDO systems. The platform includes an 
              innovative referral system that incentivizes community growth and participation.
            </p>
          </section>

          {/* Table of Contents */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><a href="#problem" className="text-blue-600 hover:text-blue-800">Problem Statement</a></li>
              <li><a href="#solution" className="text-blue-600 hover:text-blue-800">Solution Overview</a></li>
              <li><a href="#architecture" className="text-blue-600 hover:text-blue-800">Technical Architecture</a></li>
              <li><a href="#smart-contracts" className="text-blue-600 hover:text-blue-800">Smart Contract Design</a></li>
              <li><a href="#economic-model" className="text-blue-600 hover:text-blue-800">Economic Model</a></li>
              <li><a href="#security" className="text-blue-600 hover:text-blue-800">Security Considerations</a></li>
              <li><a href="#roadmap" className="text-blue-600 hover:text-blue-800">Development Roadmap</a></li>
            </ol>
          </section>

          {/* Problem Statement */}
          <section id="problem" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Problem Statement</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Traditional MUKANDO Challenges</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>Trust Issues:</strong> Dependence on a single organizer who manages all funds</li>
              <li><strong>Geographic Limitations:</strong> Members must be physically proximate</li>
              <li><strong>Lack of Transparency:</strong> No real-time visibility into fund management</li>
              <li><strong>Default Risk:</strong> No mechanism to handle member defaults</li>
              <li><strong>Scalability:</strong> Limited by personal relationships and trust networks</li>
              <li><strong>Record Keeping:</strong> Manual tracking prone to errors and disputes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Financial Inclusion Gap</h3>
            <p className="text-gray-700 leading-relaxed">
              Traditional banking systems often exclude individuals without credit history, collateral, or formal employment. 
              MUKANDO systems have historically filled this gap, but their limitations prevent wider adoption and scalability.
            </p>
          </section>

          {/* Solution Overview */}
          <section id="solution" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Solution Overview</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Decentralized MUKANDO Platform</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cash Round transforms traditional MUKANDO systems into decentralized, trustless protocols using blockchain technology. 
              The platform consists of three core components:
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Tree Contract</h4>
                <p className="text-blue-800 text-sm">
                  Manages referral relationships and eligibility for pool creation
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Pool Factory</h4>
                <p className="text-green-800 text-sm">
                  Creates and manages MUKANDO pools with configurable parameters
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">MukandoPool</h4>
                <p className="text-purple-800 text-sm">
                  Individual pool contracts that execute the rotating savings logic
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Innovations</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Trustless Execution:</strong> Smart contracts automatically manage fund distribution</li>
              <li><strong>Global Accessibility:</strong> Anyone with internet access can participate</li>
              <li><strong>Transparent Operations:</strong> All transactions visible on blockchain</li>
              <li><strong>Referral Incentives:</strong> Multi-level referral system encourages growth</li>
              <li><strong>Configurable Parameters:</strong> Flexible pool sizes, contribution amounts, and durations</li>
            </ul>
          </section>

          {/* Technical Architecture */}
          <section id="architecture" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Technical Architecture</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Blockchain Infrastructure</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Network: Polygon (MATIC)</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Low transaction fees for micro-contributions</li>
                <li>Fast block confirmation times</li>
                <li>Ethereum compatibility for security</li>
                <li>Scalable infrastructure for global adoption</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Frontend Architecture</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Next.js Application</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Server-side rendering for performance</li>
                <li>MetaMask integration for wallet connectivity</li>
                <li>Responsive design for mobile accessibility</li>
                <li>Real-time price feeds for ETH/MATIC</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Flow</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>User connects wallet via MetaMask</li>
                <li>Referral system validates eligibility</li>
                <li>Pool creation through Factory contract</li>
                <li>Automatic contribution collection</li>
                <li>Smart contract distribution to recipients</li>
                <li>Blockchain event emission for transparency</li>
              </ol>
            </div>
          </section>

          {/* Smart Contract Design */}
          <section id="smart-contracts" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Smart Contract Design</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Tree Contract</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Purpose: Referral Management</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Manages hierarchical referral relationships</li>
                <li>Tracks downline depth for eligibility</li>
                <li>Enables direct payments to referrers</li>
                <li>Prevents duplicate registrations</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">PoolFactory Contract</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Purpose: Pool Creation & Management</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Creates new MUKANDO pools with specified parameters</li>
                <li>Enforces eligibility requirements (2-level downline)</li>
                <li>Maintains registry of all created pools</li>
                <li>Emits events for pool creation tracking</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">MukandoPool Contract</h3>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Purpose: Individual Pool Execution</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li>Manages member contributions per round</li>
                <li>Automatically distributes funds to current recipient</li>
                <li>Enforces contribution deadlines</li>
                <li>Prevents double contributions</li>
                <li>Handles round progression</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Security Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Reentrancy Protection:</strong> Prevents recursive function calls</li>
              <li><strong>Access Control:</strong> Restricted pool creation to eligible users</li>
              <li><strong>Input Validation:</strong> Comprehensive parameter checking</li>
              <li><strong>State Management:</strong> Proper state updates before external calls</li>
            </ul>
          </section>

          {/* Economic Model */}
          <section id="economic-model" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Economic Model</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Pool Economics</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Pool Parameters</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Size: 2-12 members per pool</li>
                  <li>• Contribution: Fixed amount per round</li>
                  <li>• Duration: Configurable round length</li>
                  <li>• Payout Order: Pre-determined sequence</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Economic Benefits</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Interest-free credit access</li>
                  <li>• Forced savings mechanism</li>
                  <li>• Community trust building</li>
                  <li>• Reduced default risk</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Referral Incentives</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The referral system creates a sustainable growth mechanism by incentivizing community building:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Eligibility Requirements:</strong> Users need 2-level downline to create pools</li>
              <li><strong>Direct Payments:</strong> Referrers can receive direct payments from referrals</li>
              <li><strong>Batch Payments:</strong> Efficient bulk payment system for multiple referrers</li>
              <li><strong>Network Effects:</strong> Exponential growth through multi-level referrals</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Token Economics</h3>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Native Token:</strong> The platform operates using MATIC (Polygon&apos;s native token) for all transactions, 
                ensuring low fees and fast confirmations while maintaining compatibility with the broader Ethereum ecosystem.
              </p>
            </div>
          </section>

          {/* Security Considerations */}
          <section id="security" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security Considerations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Contract Security</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>Reentrancy Protection:</strong> All external calls protected against reentrancy attacks</li>
              <li><strong>Access Control:</strong> Strict eligibility requirements for pool creation</li>
              <li><strong>Input Validation:</strong> Comprehensive parameter validation and bounds checking</li>
              <li><strong>State Management:</strong> Proper state updates following checks-effects-interactions pattern</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Operational Security</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>Wallet Security:</strong> Users maintain control of their private keys</li>
              <li><strong>Transparency:</strong> All transactions publicly verifiable on blockchain</li>
              <li><strong>No Central Authority:</strong> Decentralized execution eliminates single points of failure</li>
              <li><strong>Immutable Logic:</strong> Smart contract rules cannot be changed once deployed</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Risk Mitigation</h3>
            <div className="bg-red-50 p-6 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Identified Risks & Mitigations</h4>
              <ul className="text-red-800 text-sm space-y-2">
                <li><strong>Member Default:</strong> Mitigated through pre-screening and social pressure</li>
                <li><strong>Smart Contract Bugs:</strong> Addressed through extensive testing and audits</li>
                <li><strong>Network Congestion:</strong> Polygon&apos;s scalability reduces transaction delays</li>
                <li><strong>Price Volatility:</strong> Fixed contribution amounts in MATIC</li>
              </ul>
            </div>
          </section>

          {/* Development Roadmap */}
          <section id="roadmap" className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Development Roadmap</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 1: Foundation (Completed)</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Core smart contract development</li>
                  <li>• Basic frontend interface</li>
                  <li>• MetaMask integration</li>
                  <li>• Polygon network deployment</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 2: Enhancement (In Progress)</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Advanced referral analytics</li>
                  <li>• Mobile application development</li>
                  <li>• Multi-language support</li>
                  <li>• Enhanced UI/UX improvements</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 3: Expansion (Planned)</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Cross-chain compatibility</li>
                  <li>• Advanced pool types</li>
                  <li>• Integration with DeFi protocols</li>
                  <li>• Governance token implementation</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phase 4: Ecosystem (Future)</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• DAO governance structure</li>
                  <li>• Advanced analytics dashboard</li>
                  <li>• API for third-party integrations</li>
                  <li>• Global community expansion</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cash Round represents a significant advancement in democratizing access to financial services through 
              blockchain technology. By combining the proven economic model of MUKANDO systems with modern DeFi 
              infrastructure, the platform creates a sustainable, scalable solution for financial inclusion.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The innovative referral system ensures organic growth while maintaining the social aspects that make 
              traditional MUKANDO systems successful. The use of smart contracts eliminates trust requirements while 
              preserving the community-driven nature of rotating savings associations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              As the platform evolves, Cash Round aims to become the global standard for decentralized community 
              finance, bridging the gap between traditional financial practices and modern blockchain technology.
            </p>
          </section>

          {/* Contact & Resources */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Platform Access</h3>
                <Link href="/" className="text-blue-600 hover:text-blue-800 block mb-2">
                  → Access Cash Round Platform
                </Link>
                <Link href="/pools" className="text-blue-600 hover:text-blue-800 block mb-2">
                  → View Active Pools
                </Link>
                <Link href="/pools/create" className="text-blue-600 hover:text-blue-800 block">
                  → Create New Pool
                </Link>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Resources</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Smart contracts deployed on Polygon Mainnet
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Open source codebase available
                </p>
                <p className="text-gray-600 text-sm">
                  Community-driven development
                </p>
              </div>
            </div>
          </section>
        </div>
      </LayoutWithHeader>
    </>
  );
}
