// SPDX-License-Identifier: Unlicense
import "./Inventory.sol";
pragma solidity 0.8.7;

contract InventoryManager {
    address impl_;
    address public manager;

    enum Part {
        background,
        hand_type,
        potato
    }

    mapping(uint8 => address) public backgrounds;
    mapping(uint8 => address) public hand_types;
    mapping(uint8 => address) public potatoes;

    string public constant header = //CHANGE THIS LATER
        '<svg id="backburner" width="100%" height="100%" version="1.1" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    string public constant footer = //CHANGE THIS LATER
        "<style>#backburner{shape-rendering: crispedges; image-rendering: -webkit-crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor;}</style></svg>";
    
    function getSVG(
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint8 potato_
    ) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    header,
                    get(Part.background, background_),
                    get(Part.hand_type, hand_type_),
                    hasPotato_ ? get(Part.potato, potato_) : "",
                    footer
                )
            );
    }


    constructor() {
        manager = msg.sender;
    }

    function getTokenURI(
        uint16 id_,
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint32 generation_,
        uint8 potato_
    ) external view returns (string memory) {
        
        string memory svg = Base64.encode(bytes(getSVG(background_,hand_type_,hasPotato_,potato_)));
        
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "Token #',
                                toString(id_),
                                '", "description": "A simple Token", "image": "data:image/svg+xml;base64,',
                                svg,
                                '", ',
                                getAttributes(
                                    background_,
                                    hand_type_,
                                    hasPotato_,
                                    generation_
                                ),
                                "}"
                            )
                        )
                    )
                )
            );
    }

    /*///////////////////////////////////////////////////////////////
                    INVENTORY MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function setBackgrounds(uint8 count, address source) external {
        require(msg.sender == manager, "not manager");

        for (uint8 id = 1; id <= count; id++) {
            backgrounds[id] = source;
        }
    }

    function setHands(uint8 count, address source) external {
        require(msg.sender == manager, "not manager");

        for (uint8 id = 1; id <= count; id++) {
            hand_types[id] = source;
        }
    }

    function setPotatoes(uint8 count, address source) external {
        require(msg.sender == manager, "not manager");

        for (uint8 id = 1; id <= count; id++) {
            potatoes[id] = source;
        }
    }

    /*///////////////////////////////////////////////////////////////
                    INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function call(
        address source,
        bytes memory sig
    ) internal view returns (string memory svg) {
        (bool succ, bytes memory ret) = source.staticcall(sig);
        require(succ, "failed to get data");
        svg = abi.decode(ret, (string));
    }

    function get(Part part, uint8 id) public view returns (string memory svg) {
    address source;
    if (part == Part.background) {
        source = backgrounds[id];
    } else if (part == Part.hand_type) {
        source = hand_types[id];
    } else if (part == Part.potato){
        source = potatoes[id];
    } else {
        revert("invalid part");
    }
    string memory sig;
    if (part == Part.background) {
        sig = "getPurple()";
    } else if (part == Part.hand_type) {
        sig = "getGreenSlime()";
    } else if (part == Part.potato) {
        sig = "getPotato()";
    } else {
        revert("invalid part");
    }
(bool succ, bytes memory data) = source.staticcall(
            abi.encodeWithSignature(sig)
        );    require(succ, "failed to get data");
    return wrapTag(abi.decode(data, (string)));
}

function wrapTag(string memory uri) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<image x="1" y="1" width="60" height="60" image-rendering="pixelated" preserveAspectRatio="xMidYMid" xlink:href="data:image/png;base64,',
                    uri,
                    '"/>'
                )
            );
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function getAttributes(
        uint8 background_,
        uint8 hand_type_,
        bool hasPotato_,
        uint32 generation_
    ) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '"attributes": [',
                    getBackgroundAttributes(background_),
                    ",",
                    getHandAttributes(hand_type_),
                    ',{"trait_type": "Potato", "value":"',
                    hasPotato_ ? "Yes" : "No",
                    '"},{"display_type": "number","trait_type": "Generation", "value":',
                    toString(generation_),
                    "}]"
                )
            );
    }

    function getBackgroundAttributes(
        uint8 background_
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"Body", "value":"',
                    getBackgroundName(background_),
                    '"}'
                )
            );
    }

    function getHandAttributes(
        uint8 hand_type_
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"Hand Type", "value": "',
                    getHandName(hand_type_),'"}'
                )
            );
    }


    // Here, we do sort of a Binary Search to find the correct name. Not the pritiest code I've wrote, but hey, it works!

    function getBackgroundName(uint8 id) public pure returns (string memory) {
        if (id > 40) return getUniqueName(id);
        if (id < 20) {
            if (id < 10) {
                if (id < 5) {
                    if (id < 3) {
                        return id == 1 ? "Background 1" : "Background 2";
                    }
                    return id == 3 ? "Background 3" : "Dark Background 1";
                }
                if (id < 7)
                    return id == 5 ? "Dark Background 2" : "Dark Background 3";
                return
                    id == 7 ? "Red Background 1" : id == 8 ? "Red Background 2" : "Red Background 3";
            }
            if (id <= 15) {
                if (id < 13) {
                    return
                        id == 10 ? "Blood Red Orc 1" : id == 11
                            ? "Blood Red Orc 2"
                            : "Blood Red Orc 3";
                }
                return
                    id == 13 ? "Clay Orc 1" : id == 14
                        ? "Clay Orc 2"
                        : "Clay Orc 3";
            }
            if (id < 18)
                return id == 16 ? "Dark Clay Orc 1" : "Dark Clay Orc 2";
            return id == 18 ? "Dark Clay Orc 3" : "Blue Orc 1";
        }

        if (id < 30) {
            if (id < 25) {
                if (id < 23) {
                    return
                        id == 20 ? "Blue Orc 2" : id == 21
                            ? "Blue Orc 3"
                            : "Midnight Blue Orc 1";
                }
                return id == 23 ? "Midnight Blue Orc 2" : "Midnight Blue Orc 3";
            }

            if (id < 27) return id == 25 ? "Albino Orc 1" : "Albino Orc 2";
            return "Albino Orc 3";
        }
    }

    function getHandName(uint8 id) public pure returns (string memory) {
        if (id > 40) return getUniqueName(id);
        if (id < 20) {
            if (id < 10) {
                if (id < 5) {
                    if (id < 3) {
                        return id == 1 ? "Hand 1" : "Hand 2";
                    }
                    return id == 3 ? "Hand 3" : "Hand 4";
                }
                if (id < 7)
                    return id == 5 ? "Leather Hand 1" : "Orcish Hand 1";
                return
                    id == 7 ? "Leather Hand 1" : id == 8
                        ? "Iron Hand 1"
                        : "Bone Hand 2";
            }
            if (id <= 15) {
                if (id < 13) {
                    return
                        id == 10 ? "Full Orc Hand 2" : id == 11
                            ? "Chainmail Hand 2"
                            : "Strange Helm +2";
                }
                return
                    id == 13 ? "Full Plate Helm +3" : id == 14
                        ? "Chainmail Coif +3"
                        : "Boar Head +3";
            }
            if (id < 18)
                return id == 16 ? "Orb of Protection +3" : "Royal Thingy +4";
            return id == 18 ? "Dark Iron Helm +4" : "Cursed Hood +4";
        }

        if (id < 30) {
            if (id < 25) {
                if (id < 23) {
                    return
                        id == 20 ? "Red Bandana +4" : id == 21
                            ? "Thorned Helm +5"
                            : "Demon Skull +5";
                }
                return id == 23 ? "Treasure Chest +5" : "Cursed Hood +5";
            }

            if (id < 27)
                return id == 25 ? "Blue Knight Helm +6" : "Parasite +6";
            return
                id == 27 ? "Dragon Eyes +6" : id == 28
                    ? "Horned Cape +6"
                    : "Nether Blindfold +7";
        }
        if (id <= 35) {
            if (id < 33) {
                return
                    id == 30 ? "Lightning Crown +7" : id == 31
                        ? "Master Warlock Cape +7"
                        : "Red Knight Helm +7";
            }
            return
                id == 33 ? "Beholder Head +8" : id == 34
                    ? "Ice Crown +8"
                    : "Band of the Dark Lord +8";
        }
        if (id < 38) return id == 36 ? "Helm of Evil +8" : "Blazing Horns +9";
        return
            id == 38 ? "Possessed Helm +9" : id == 39
                ? "Molten Crown +9"
                : "Helix Helm +9";
    }

    function getMainhandName(uint8 id) public pure returns (string memory) {
        if (id > 40) return getUniqueName(id);
        if (id < 20) {
            if (id < 10) {
                if (id < 5) {
                    if (id < 3) {
                        return id == 1 ? "Pickaxe" : "Torch";
                    }
                    return id == 3 ? "Club" : "Pleb Staff";
                }
                if (id < 7) return id == 5 ? "Short Sword +1" : "Dagger +1";
                return
                    id == 7 ? "Simple Axe +1" : id == 8
                        ? "Fiery Poker +1"
                        : "Large Axe +2";
            }
            if (id <= 15) {
                if (id < 13) {
                    return
                        id == 10 ? "Iron Hammer +2" : id == 11
                            ? "Iron Mace +2"
                            : "Jagged Axe +2";
                }
                return
                    id == 13 ? "Enchanted Poker +3" : id == 14
                        ? "Curved Sword +3"
                        : "Ultra Mallet +3";
            }
            if (id < 18)
                return id == 16 ? "Disciple Staff +3" : "Assassin Blade +4";
            return id == 18 ? "Swamp Staff +4" : "Simple Wand +4";
        }

        if (id < 30) {
            if (id < 25) {
                if (id < 23) {
                    return
                        id == 20 ? "Royal Blade +4" : id == 21
                            ? "Skull Shield +5"
                            : "Skull Crusher Axe +5";
                }
                return id == 23 ? "Flaming Staff +5" : "Flaming Royal Blade +5";
            }

            if (id < 27)
                return id == 25 ? "Berserker Sword +6" : "Necromancer Staff +6";
            return
                id == 27 ? "Flaming Skull Shield +6" : id == 28
                    ? "Frozen Scythe +6"
                    : "Blood Sword +7";
        }
        if (id <= 35) {
            if (id < 33) {
                return
                    id == 30 ? "Dark Lord Staff +7" : id == 31
                        ? "Bow of Artemis +7"
                        : "Ice Sword +7";
            }
            return
                id == 33 ? "Cryptic Staff +8" : id == 34
                    ? "Nether Lance +8"
                    : "Demonic Axe +8";
        }
        if (id < 38)
            return id == 36 ? "Old Moon Sword +8" : "Lightning Lance +9";
        return
            id == 38 ? "Molten Hammer +9" : id == 39
                ? "Possessed Great Staff +9"
                : "Helix Lance +9";
    }

    function getOffhandName(uint8 id) public pure returns (string memory) {
        if (id > 40) return getUniqueName(id);
        if (id < 20) {
            if (id < 10) {
                if (id < 5) {
                    if (id < 3) {
                        return id == 1 ? "None" : "None";
                    }
                    return id == 3 ? "None" : "None";
                }
                if (id < 7)
                    return
                        id == 5 ? "Wooden Shield +1" : "Paper Hands Shield +1";
                return
                    id == 7 ? "Dagger +1" : id == 8
                        ? "Pirate Hook +1"
                        : "Offhand Axe +2";
            }
            if (id <= 15) {
                if (id < 13) {
                    return
                        id == 10 ? "Offhand Slasher +2" : id == 11
                            ? "Large Shield +2"
                            : "Bomb +2";
                }
                return
                    id == 13 ? "Offhand Poker +3" : id == 14
                        ? "Reinforced Shield +3"
                        : "War Banner +3";
            }
            if (id < 18)
                return id == 16 ? "Hand Cannon +3" : "Metal Kite Shield +4";
            return id == 18 ? "Crossbow +4" : "Cursed Skull +4";
        }

        if (id < 30) {
            if (id < 25) {
                if (id < 23) {
                    return
                        id == 20 ? "Spiked Shield +4" : id == 21
                            ? "Cursed Totem +5"
                            : "Grimoire +5";
                }
                return id == 23 ? "Offhand Glaive +5" : "Frost Side Sword +5";
            }

            if (id < 27)
                return id == 25 ? "Magic Shield +6" : "Enchanted Glaive +6";
            return
                id == 27 ? "Burning Wand +6" : id == 28
                    ? "Burning Shield +6"
                    : "Burning Blade +7";
        }
        if (id <= 35) {
            if (id < 33) {
                return
                    id == 30 ? "Holy Scepter +7" : id == 31
                        ? "Possessed Skull +7"
                        : "Demonic Grimoire +7";
            }
            return
                id == 33 ? "Scepter of Frost +8" : id == 34
                    ? "Demonic Scythe +8"
                    : "Lightning Armband of Power +8";
        }
        if (id < 38) return id == 36 ? "Ice Staff +8" : "Nether Shield +9";
        return
            id == 38 ? "Molten Scimitar +9" : id == 39
                ? "Staff of the Dark Lord +9"
                : "Helix Scepter +9";
    }

    function getUniqueName(uint8 id) internal pure returns (string memory) {
        if (id < 47) {
            if (id < 44) {
                return
                    id == 41 ? "Cthulhu" : id == 42
                        ? "Vorgak The War Chief"
                        : "Gromlock The Destroyer";
            }
            return
                id == 44 ? "Yuckha The Hero" : id == 45
                    ? "Orgug The Master Warlock"
                    : "Hoknuk The Demon Tamer";
        }
        if (id < 50) {
            return
                id == 47 ? "Lava Man" : id == 48
                    ? "hagra the Zombie"
                    : "Morzul The Ice Warrior";
        }
        return
            id == 50 ? "T4000 The MechaOrc" : id == 51
                ? "Slime Orc The Forgotten"
                : "Mouse God";
    }
}

/// @title Base64
/// @author Brecht Devos - <brecht@loopring.org>
/// @notice Provides a function for encoding some bytes in base64
/// @notice NOT BUILT BY ETHERORCS TEAM. Thanks Bretch Devos!
library Base64 {
    string internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // load the table into memory
        string memory table = TABLE;

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((data.length + 2) / 3);

        // add some extra buffer at the end required for the writing
        string memory result = new string(encodedLen + 32);

        assembly {
            // set the actual output length
            mstore(result, encodedLen)

            // prepare the lookup table
            let tablePtr := add(table, 1)

            // input ptr
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))

            // result ptr, jump over length
            let resultPtr := add(result, 32)

            // run over the input, 3 bytes at a time
            for {

            } lt(dataPtr, endPtr) {

            } {
                dataPtr := add(dataPtr, 3)

                // read 3 bytes
                let input := mload(dataPtr)

                // write 4 characters
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
                mstore(
                    resultPtr,
                    shl(248, mload(add(tablePtr, and(input, 0x3F))))
                )
                resultPtr := add(resultPtr, 1)
            }

            // padding with '='
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }

        return result;
    }
}