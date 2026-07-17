import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { expect } from "chai";
import hre from "hardhat";

describe("PrivatePayToken", function () {
  async function deployFixture() {
    await hre.run("task:cofhe-mocks:deploy");
    const [alice, bob] = await hre.ethers.getSigners();
    const factory = await hre.ethers.getContractFactory("PrivatePayToken");
    const token = await factory.deploy();
    const aliceClient = await hre.cofhe.createClientWithBatteries(alice);
    const bobClient = await hre.cofhe.createClientWithBatteries(bob);
    return { token, alice, bob, aliceClient, bobClient };
  }

  async function balanceOf(
    token: Awaited<ReturnType<typeof deployFixture>>["token"],
    account: Awaited<ReturnType<typeof hre.ethers.getSigners>>[number],
    client: Awaited<ReturnType<typeof hre.cofhe.createClientWithBatteries>>,
  ) {
    const handle = await token.connect(account).encryptedBalanceOf(account.address);
    return client.decryptForView(handle, FheTypes.Uint64).execute();
  }

  it("mints an encrypted faucet balance", async function () {
    const { token, alice, aliceClient } = await loadFixture(deployFixture);
    await token.connect(alice).claimFromFaucet();
    expect(await balanceOf(token, alice, aliceClient)).to.equal(100_000n);
  });

  it("transfers an encrypted amount", async function () {
    const { token, alice, bob, aliceClient, bobClient } = await loadFixture(deployFixture);
    await token.connect(alice).claimFromFaucet();
    const [amount] = await aliceClient.encryptInputs([Encryptable.uint64(25_000n)]).execute();
    await token.connect(alice).confidentialTransfer(bob.address, amount);
    expect(await balanceOf(token, alice, aliceClient)).to.equal(75_000n);
    expect(await balanceOf(token, bob, bobClient)).to.equal(25_000n);
  });

  it("moves zero when the encrypted amount exceeds the balance", async function () {
    const { token, alice, bob, aliceClient, bobClient } = await loadFixture(deployFixture);
    await token.connect(alice).claimFromFaucet();
    const [amount] = await aliceClient.encryptInputs([Encryptable.uint64(200_000n)]).execute();
    await token.connect(alice).confidentialTransfer(bob.address, amount);
    expect(await balanceOf(token, alice, aliceClient)).to.equal(100_000n);
    expect(await balanceOf(token, bob, bobClient)).to.equal(0n);
  });

  it("enforces the faucet cooldown", async function () {
    const { token, alice } = await loadFixture(deployFixture);
    await token.connect(alice).claimFromFaucet();
    await expect(token.connect(alice).claimFromFaucet()).to.be.revertedWith("Faucet cooldown active");
  });
});
