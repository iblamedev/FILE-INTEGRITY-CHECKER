# FILE-INTEGRITY-CHECKER

*COMPANY*    :    CODTECH IT SOLUTIONS

*NAME*       :    DEV BALAJI A

*INTERN ID*  :    CITS0D23

*DOMAIN*     :    CYBER SECURITY

*DURATION*   :    4 WEEKS

*MENTOR*     :    NEELA SANTOSH

The File Integrity Checker is a cybersecurity tool designed to detect unauthorized modifications in files by comparing cryptographic hash values. Its primary purpose is to ensure the authenticity and integrity of files, especially in environments where data tampering, malware infections, or unauthorized file changes pose significant risks.

This tool works by using cryptographic hash functions such as SHA-256 to compute a unique digital fingerprint for a file. Once the hash is generated and stored, it can later be used to compare against the current hash of the same file. If both hash values match, it means the file has not been tampered with. If they differ, it indicates that the file has been altered, either intentionally or unintentionally.

In our implementation, the File Integrity Checker features a modern web interface that allows users to drag and drop files for real-time integrity checks. The interface displays key metrics such as the total number of files scanned, how many are verified, how many are tampered with, and how many are unknown. It also maintains a file database, storing the hash values and metadata of each file, such as name, size, and last modified time.

Users can import or export the file database as a JSON file, making the system easily portable and backup-friendly. This tool provides functionalities to verify single files or batch-verify all files within the database. It is especially useful for developers, system administrators, and security professionals who need to ensure that critical configuration files, scripts, or executables have not been altered.

Technically, the tool is built using React for the frontend and uses browser-based file APIs and Web Crypto API for hashing. It ensures that all operations, including hash computation and verification, occur client-side, enhancing user privacy and data security.

Overall, this tool combines functionality and design to deliver an intuitive, secure, and efficient solution for file integrity monitoring. It plays a vital role in maintaining trust in system files, application resources, and user documents.
